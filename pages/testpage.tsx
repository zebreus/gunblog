import { DemoPage } from "../components/DemoPage";
import { useGun } from "../hooks/gun/useGun";

const Testpage = () => {
  const gun = useGun().get("guncmsblogthingRoot");
  return (
    <div>
      <h2>Headline</h2>
      <DemoPage root={gun.get("pages").get("a")} />
    </div>
  );
};

export default Testpage;
