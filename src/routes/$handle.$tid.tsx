import { createFileRoute, useParams } from "@tanstack/react-router";
import { getPdsEndpoint, resolveFromIdentity } from "@/lib/resolv";
import { useEffect, useState } from "react";
import { Markdown } from "@/components/md";
import ThemeSwitcher from "@/components/theme-switcher";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$handle/$tid")({
  component: RouteComponent,
});

// Gets the user's PDS from their handle
async function resolveUser(
  handle: string,
): Promise<{ handle: string; did: string; pds: string } | undefined> {
  let id = await resolveFromIdentity(handle);
  let pds = getPdsEndpoint(id.doc);

  if (!pds) {
    console.error(`No PDS found for handle: ${handle}`);
    return undefined;
  }

  console.log(id.doc.alsoKnownAs[0], id.did, pds);

  return {
    handle: id.doc.alsoKnownAs[0].replace("at://", "") || handle,
    did: id.did,
    pds: pds.toString(),
  };
}

// https://pds.futur.blue/xrpc/com.atproto.repo.getRecord?repo=did%3Aplc%3Auu5axsmbm2or2dngy4gwchec&collection=app.bsky.feed.repost&rkey=3lsceslknkc2w
async function fetchRecordFromPds(
  pds: string,
  did: string,
  lex: string,
  rkey: string,
): Promise<Response | null> {
  return await fetch(
    `${pds}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=${lex}&rkey=${rkey}`,
  );
}

function RouteComponent() {
  const { handle, tid } = useParams({ strict: false });
  const [md, setMd] = useState<any | null>(null);
  const [user, setUser] = useState<{
    handle: string;
    did: string;
    pds: string;
  } | null>(null);

  const [err, setErr] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (!handle || !tid) {
        setErr(new Error("Handle or tid is missing"));
        return;
      }
      // resolve user
      let pds = await resolveUser(handle);

      if (!pds) {
        setErr(new Error(`PDS not found for handle: ${handle}`));
        return;
      }
      setUser(pds);

      let rec = await fetchRecordFromPds(
        pds.pds,
        pds.did,
        "com.whtwnd.blog.entry",
        tid,
      );

      if (!rec || !rec.ok) {
        setErr(
          new Error(
            `Failed to fetch record: ${rec ? rec.statusText : "No response"}`,
          ),
        );
        return;
      }

      const j = await rec.json();

      if (j && j.value && j.value) {
        setMd(j.value || null);
      } else {
        setErr(new Error("Invalid record format or no content found"));
      }
    };

    fetchMarkdown();
  }, [handle, tid]);

  if (err) {
    return <div>Error: {err.message}</div>;
  }

  if (!md) {
    return <div className="flex justify-center align-middle">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col p-4">
        <div className="max-w-prose blur-reveal">
          <div className="blur-reveal-content">
            <div className="flex justify-between items-center w-full mb-24">
              <Link to="/">whitewind reader</Link>
              <ThemeSwitcher />
            </div>
            <h1 className="text-5xl font-bold mb-4">{md?.title}</h1>
            <p className="text-gray-500 mb-8">
              {user?.handle} -{" "}
              {new Date(md?.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <Markdown>{md?.content}</Markdown>
          </div>
        </div>
      </div>

      <div className="progressive-blur-overlay" />
    </>
  );
}
