import { IGunChain, IGunInstance } from "gun";
import { useGun } from "../hooks/gun/useGun";
import { useGunElement, useGunElements } from "../hooks/gun/useGunElement";
import { useState } from "react";
import { Paragraph } from "./Paragraph";
import { EditableElement } from "./EditableElement";
import { ContextualElement } from "./ContextualElement";

interface PageProps {
  root: IGunChain<any>;
}

const subPageColors = ["#50514f", "#f25f5c", "#ffE066", "247ba0", "#70c1b3"];
const subPageTextColors = ["white", "white", "black", "white", "black"];

export const DemoPage = ({ root }: PageProps) => {
  const titleField = root.get("title");
  const title = useGunElement(titleField);
  const fields = root.get("content");
  const elements = useGunElements(fields.map());
  const [field, setField] = useState<string>("alpha");
  const actionOne = () => {
    setField((field) => (field === "alpha" ? "beta" : "alpha"));
  };
  return (
    <div>
      {title ? (
        <EditableElement
          onChange={(value) => titleField.put(value)}
          contentEditable
        >
          <h1>{(title as string) || "Titel"}</h1>
        </EditableElement>
      ) : null}
      {elements ? (
        Object.entries(elements).map(([key, value]) => (
          <>
            <hr />
            <ContextualElement key={key} root={fields.get(key)} />
            <hr />
          </>
        ))
      ) : (
        <span>No ps</span>
      )}
      <button
        onClick={() => {
          fields.set({ type: "paragraph", content: "Hello world" });
        }}
      >
        ADD PARAGRAPH
      </button>
      <button
        onClick={() => {
          const randomId = Math.floor(Math.random() * subPageColors.length);
          fields.set({
            type: "subpage",
            target: { type: "page", title: "Neue Unterseite" },
            color: subPageColors[randomId],
            textColor: subPageTextColors[randomId],
          });
        }}
      >
        ADD SUBPAGE
      </button>
    </div>
  );
};
