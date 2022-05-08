import { GetStaticProps } from "next";
import { clearGun, getGun, useGun } from "../../hooks/gun/useGun";
import { getGunElement } from "../../hooks/gun/useGunElement";
import { withExportCache, withImportCache } from "../../util/gunCache";
import { DemoPage } from "../../components/DemoPage";

export async function getStaticPaths() {
  const gun = getGun().get("guncmsblogthingRoot");
  gun.get("pages").get("a").get("id").put("a");
  gun.get("pages").get("a").get("title").put("Gun CMS Blog Thing");

  const pages: any = await getGunElement(gun.get("pages"));
  const pageIds = pages ? Object.keys(pages) : [];
  return {
    paths: pageIds.map((pageId) => ({ params: { pageId } })),
    fallback: true, // false or 'blocking'
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageId =
    typeof context.params?.pageId === "string"
      ? context.params.pageId
      : context.params?.pageId?.[0] || "a";
  console.log("pageId", pageId);

  clearGun();
  const gun = getGun().get("guncmsblogthingRoot");

  const page = gun.get("pages").get(pageId || "");
  const pageElements = await getGunElement(page);
  if (pageElements && typeof pageElements === "object") {
    const keys = Object.keys(pageElements);
    const a = keys.map(async (key) => {
      const subPageElements = await getGunElement(page.get(key));
      if (subPageElements && typeof subPageElements === "object") {
        const keys = Object.keys(subPageElements);
        const b = keys.map(async (subKey) => {
          const subSubPageElements = await getGunElement(
            page.get(key).get(subKey)
          );
          if (subSubPageElements && typeof subSubPageElements === "object") {
            const keys = Object.keys(subSubPageElements);
            const c = keys.map(async (subSupSubKey) => {
              const subSubSubPageElements = await getGunElement(
                page.get(key).get(subKey).get(subSupSubKey)
              );
            });
            await Promise.all(c);
          }
        });
        await Promise.all(b);
      }
    });
    Promise.all(a);
  }

  const props = {
    props: withExportCache({ pageId: pageId }),
    revalidate: 30,
  };

  return props;
};

const Testpage = ({ pageId }: { pageId: string }) => {
  const gun = useGun().get("guncmsblogthingRoot");
  const root = gun.get("pages").get(pageId);
  return (
    <div className="bg">
      <style jsx>{`
        .bg {
          background: #247ba0;
          color: white;
          width: 100%;
          height: 100%;
          position: absolute;
          padding: 1rem;
        }
      `}</style>
      <DemoPage root={root} />
    </div>
  );
};

export default withImportCache(Testpage);
