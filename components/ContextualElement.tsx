import { IGunChain } from "gun";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useGunElement } from "../hooks/gun/useGunElement";
import "react-quill/dist/quill.bubble.css";
import { DemoPage } from "./DemoPage";
import { PageLink } from "./PageLink";
import { Paragraph } from "./Paragraph";

interface ContextualElementProps {
  root: IGunChain<any>;
}

export const ContextualElement = ({ root }: ContextualElementProps) => {
  const typeField = root.get("type");
  const type = useGunElement(typeField) as "paragraph" | "subpage" | "page";

  switch (type) {
    case "paragraph":
      return <Paragraph root={root} />;
    case "subpage":
      return <PageLink root={root} />;
    case "page":
      return <DemoPage root={root} />;
    default:
      return <div>Unknown type</div>;
  }
};
