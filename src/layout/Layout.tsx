// import React, { FC, ReactNode } from "react";
import ChatBot from "../components/chatbot/ChatBot";
import DataView from "../components/dataview/DataView";
import FileUpload from "../components/fileupload/FileUpload";
import "./Layout.css";

// type LayoutProps = {
//   children: ReactNode;
// };

// const Layout: FC<LayoutProps> = ({ children }) => {
//   const leftChildren: ReactNode[] = [];
//   const rightChildren: ReactNode[] = [];

// Separate children into left and right panels
//   React.Children.forEach(children, (child) => {
//     if (React.isValidElement(child)) {
//       if (child.props?.panel === "left") {
//         leftChildren.push(child);
//       } else if (child.props?.panel === "right") {
//         rightChildren.push(child);
//       }
//     }
//   });

const Layout = () => {
  return (
    <>
      <div className="layout-container">
        <div className="layout-left-panel">
          <div>
            <FileUpload />
          </div>
          <div>
            <DataView />
          </div>
        </div>
        <div className="layout-right-panel">
          <ChatBot />
        </div>
      </div>
    </>
  );
};

export default Layout;
