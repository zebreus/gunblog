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

  const title = (useGunElement(titleField) as string) || "No text yet";

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

      <button onClick={() => setOpen(true)}>Open subpage</button>
      {open ? (
        <div className="subpage">
          <div className="background" onClick={() => setOpen(false)} />
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
