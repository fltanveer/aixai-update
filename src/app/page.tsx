import Content from "@/app/_pages/overview.generated";
import JsonLd from "@/components/JsonLd";
import { pageLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMeta("/");

export default function Page() {
  return (
    <>
      <JsonLd data={pageLd("/", SITE_URL)} />
      <Content />
    </>
  );
}
