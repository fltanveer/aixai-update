import Content from "@/app/_pages/framework.generated";
import JsonLd from "@/components/JsonLd";
import { pageLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMeta("/framework");

export default function Page() {
  return (
    <>
      <JsonLd data={pageLd("/framework", SITE_URL)} />
      <Content />
    </>
  );
}
