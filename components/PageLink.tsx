import { IGunChain } from "gun";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useGunElement } from "../hooks/gun/useGunElement";
import "react-quill/dist/quill.bubble.css";
import { DemoPage } from "./DemoPage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface PageLinkProps {
  root: IGunChain<any>;
}

export const PageLink = ({ root }: PageLinkProps) => {
  const targetField = root.get("target");
  const titleField = root.get("title");
  const targetTitleField = targetField.get("title");
  const targetIdField = targetField.get("id");
  const thisIdField = root.back().back().get("id");

  const title = (useGunElement(titleField) as string) || "No text yet";
  const targetTitle =
    (useGunElement(targetTitleField) as string) || "GUN GUN GUN";
  const targetId = (useGunElement(targetIdField) as string) || "a";
  const thisId = (useGunElement(thisIdField) as string) || "a";

  const color = (useGunElement(root.get("color")) as string) || "white";
  const textColor = (useGunElement(root.get("textColor")) as string) || "black";

  const [open, setOpen] = useState(false);

  return (
    <div className="paragraph">
      <style jsx>{`
        @keyframes example {
          from {
            //width: 0;
            //height: 0;
            transform: scale(0);
          }
          to {
            transform: scale(1);
            width: 100%;
            height: 100%;
          }
        }
        @keyframes background {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes border {
          from {
            border: 1rem dashed #00000000;
          }
          to {
            border: 0.5rem dashed #000000ff;
          }
        }
        .subpage {
          display: flex;
          justify-content: center;
          align-items: center;

          position: absolute;
          inset: 2rem;
          border: 0.5rem dashed #000000ff;

          animation-name: border;
          animation-duration: 0.4s;
          z-index: 2;
        }
        .subpage .content {
          padding: 1rem;
          position: absolute;
          background: ${color};
          color: ${textColor};
          width: 100%;
          height: 100%;
          animation-name: example;
          animation-duration: 0.4s;
        }
        .subpage .background {
          position: fixed;
          inset: 0;
          background: #00000020;
          animation-name: background;
          animation-duration: 0.4s;
        }
      `}</style>

      <button
        onClick={() => {
          setOpen(true);
          window.history.replaceState({}, targetTitle, `/fromgun/${targetId}`);
        }}
      >
        Open subpage
      </button>
      {open ? (
        <div className="subpage">
          <div
            className="background"
            onClick={() => {
              setOpen(false);
              window.history.replaceState(
                {},
                targetTitle,
                `/fromgun/${thisId}`
              );
            }}
          />
          <div className="content">
            <DemoPage root={targetField} />
          </div>
        </div>
      ) : null}
      {/* <button onClick={() => setEditing((e) => !e)}>edit</button> */}
      <button onClick={() => root.put(null)}>delete</button>
    </div>
  );
};
