// blatantly stolen from https://github.com/mary-ext/atcute/blob/trunk/packages/oauth/browser-client/
// MIT License

/**
 * @module
 * DID document-related functionalities.
 * This module is exported for convenience and is no way part of public API,
 * it can be removed at any time.
 */

/**
 * Retrieves AT Protocol PDS endpoint from the DID document, if available
 * @param doc DID document
 * @returns The PDS endpoint, if available
 */
export const getPdsEndpoint = (doc: DidDocument): string | undefined => {
  return getServiceEndpoint(doc, "#atproto_pds", "AtprotoPersonalDataServer");
};

/**
 * Retrieve a service endpoint from the DID document, if available
 * @param doc DID document
 * @param serviceId Service ID
 * @param serviceType Service type
 * @returns The requested service endpoint, if available
 */
export const getServiceEndpoint = (
  doc: DidDocument,
  serviceId: string,
  serviceType: string,
): string | undefined => {
  const did = doc.id;

  const didServiceId = did + serviceId;
  const found = doc.service?.find(
    (service) => service.id === serviceId || service.id === didServiceId,
  );

  if (
    !found ||
    found.type !== serviceType ||
    typeof found.serviceEndpoint !== "string"
  ) {
    return undefined;
  }

  return validateUrl(found.serviceEndpoint);
};
const validateUrl = (urlStr: string): string | undefined => {
  let url;
  try {
    url = new URL(urlStr);
  } catch {
    return undefined;
  }

  const proto = url.protocol;

  if (url.hostname && (proto === "http:" || proto === "https:")) {
    return urlStr;
  }
};

/**
 * DID document
 */
export interface DidDocument {
  id: string;
  alsoKnownAs?: string[];
  verificationMethod?: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
  }[];
  service?: {
    id: string;
    type: string;
    serviceEndpoint: string | Record<string, unknown>;
  }[];
}

// resolve pid
export const isDid = (did: string) => {
  // is this a did? regex
  return did.match(/^did:[a-z]+:[\S\s]+/);
};

export const resolveHandle = async (
  handle: string,
  resolverAppViewUrl: string = "https://public.api.bsky.app",
): Promise<string> => {
  const url =
    resolverAppViewUrl +
    `/xrpc/com.atproto.identity.resolveHandle` +
    `?handle=${handle}`;

  const response = await fetch(url);
  if (response.status === 400) {
    throw new Error(`domain handle not found`);
  } else if (!response.ok) {
    throw new Error(`directory is unreachable`);
  }

  const json = await response.json();
  return json.did;
};

export const getDidDocument = async (did: string) => {
  const colon_index = did.indexOf(":", 4);

  const type = did.slice(4, colon_index);
  const ident = did.slice(colon_index + 1);

  // get a did:plc
  if (type === "plc") {
    const res = await fetch("https://plc.directory/" + did);

    if (res.status === 400) {
      throw new Error(`domain handle not found`);
    } else if (!res.ok) {
      throw new Error(`directory is unreachable`);
    }

    const json = await res.json();
    return json;
  } else if (type === "web") {
    if (
      !ident.match(/^([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\.[a-zA-Z]{2,}))$/)
    ) {
      throw new Error(`invalid domain handle`);
    }
    const res = await fetch(`https://${ident}/.well-known/did.json`);

    if (res.status === 400) {
      throw new Error(`domain handle not found`);
    } else if (!res.ok) {
      throw new Error(`directory is unreachable`);
    }

    const json = await res.json();
    return json;
  }
};

export const resolveFromIdentity = async (
  identity: string,
  resolverAppViewUrl: string = "https://public.api.bsky.app",
) => {
  let did: string;
  // is this a did? regex
  if (isDid(identity)) {
    did = identity;
  } else {
    did = await resolveHandle(identity, resolverAppViewUrl);
  }

  let doc = await getDidDocument(did);
  let pds = getPdsEndpoint(doc);

  if (!pds) {
    throw new Error("account doesn't have PDS endpoint?");
  }

  return {
    did,
    doc,
    identity,
    pds: new URL(pds),
  };
};
