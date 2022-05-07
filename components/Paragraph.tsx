import { IGunChain } from "gun";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useGunElement } from "../hooks/gun/useGunElement";
import "react-quill/dist/quill.bubble.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ParagraphProps {
  root: IGunChain<any>;
}

export const Paragraph = ({ root }: ParagraphProps) => {
  const textNode = root.get("content");
  const text = (useGunElement(textNode) as string) || "No text yet";
  const divRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const item = useGunElement();
  const handleChange = () => {
    const content = divRef.current?.innerHTML;
    if (content) {
      textNode.put(content);
    }
  };
  return (
    <div className="paragraph">
      <style jsx>{`
        .paragraph {
          position: relative;
        }
        button {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #04aa6d;
          border: none;
          color: white;
          padding: 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          border-radius: 50%;
          opacity: 0.2;
        }
        .paragraph:hover > button {
          opacity: 1;
        }
      `}</style>

      {editing ? (
        <ReactQuill
          onBlur={() => setEditing((e) => !e)}
          style={{ background: "red" }}
          theme="bubble"
          value={text}
          onChange={(content, delta, source, editor) => {
            if (content) {
              textNode.put(content);
            }
          }}
        />
      ) : (
        <div className="quill" onClick={() => setEditing((e) => !e)}>
          <div className="ql-container ql-bubble">
            <div
              className="ql-editor"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        </div>
      )}
      {/* <button onClick={() => setEditing((e) => !e)}>edit</button> */}
      <button onClick={() => root.put(null)}>delete</button>
    </div>
  );
};
