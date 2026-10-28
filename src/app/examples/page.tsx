import Content from "@/app/_pages/examples.generated";
import JsonLd from "@/components/JsonLd";
import { pageLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMeta("/examples");

export default function Page() {
  return (
    <>
      <JsonLd data={pageLd("/examples", SITE_URL)} />
      <Content />
    </>
  );
}
