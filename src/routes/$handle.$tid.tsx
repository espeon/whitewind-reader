import { createFileRoute, useParams } from "@tanstack/react-router";
import { getPdsEndpoint, resolveFromIdentity } from "@/lib/resolv";
import { useEffect, useState } from "react";
import { Markdown } from "@/components/md";
import ThemeSwitcher from "@/components/theme-switcher";
import { Link } from "@tanstack/react-router";
import { Spinner } from "@/components/spinner";

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
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (!handle || !tid) {
        setErr(new Error("Handle or tid is missing"));
        setLoading(false);
        return;
      }
      // resolve user
      let pds = await resolveUser(handle);

      if (!pds) {
        setErr(new Error(`PDS not found for handle: ${handle}`));
        setLoading(false);
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
        setLoading(false);
        return;
      }

      const j = await rec.json();

      if (j && j.value && j.value) {
        setMd(j.value || null);
      } else {
        setErr(new Error("Invalid record format or no content found"));
      }
      setTimeout(() => setFadeOut(true), 100); // Start fade out
      setTimeout(() => setLoading(false), 400); // Remove after fade
    };

    fetchMarkdown();
  }, [handle, tid]);

  if (err) {
    return <div>Error: {err.message}</div>;
  }

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-black flex h-screen justify-center align-middle loading-fade${fadeOut ? " out" : ""}`}
      >
        <Spinner />
      </div>
    );
  }

  if (!md) {
    return null;
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col p-4">
        <div className="max-w-prose blur-reveal mb-24">
          <div className="blur-reveal-content">
            <div className="flex justify-between items-center w-full mb-24">
              <Link to="/">whitewind reader</Link>
              <ThemeSwitcher />
            </div>
            <h1 className="text-5xl font-bold mb-4">{md?.title}</h1>
            <p className="text-gray-400 mb-8">
              <a
                href={`https://bsky.app/profile/${user?.handle || handle}`}
                className="text-fuchsia-800/75 dark:text-fuchsia-300/75 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors duration-200"
              >
                {user?.handle || handle}
              </a>{" "}
              -{" "}
              {new Date(md?.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <Markdown initialDelayMs={150}>{md?.content}</Markdown>
          </div>
        </div>
        <Link
          to="/"
          className="text-fuchsia-800 dark:text-fuchsia-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors duration-200"
        >
          back to home
        </Link>
      </div>

      <div className="progressive-blur-overlay" />
    </>
  );
}
