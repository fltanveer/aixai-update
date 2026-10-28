import Content from "@/app/_pages/domains.generated";
import JsonLd from "@/components/JsonLd";
import { pageLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMeta("/domains");

export default function Page() {
  return (
    <>
      <JsonLd data={pageLd("/domains", SITE_URL)} />
      <Content />
    </>
  );
}
