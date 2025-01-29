// import React, { FC, ReactNode } from "react";
import Chart from "../components/chart/Chart";
import ChatBot from "../components/chatbot/ChatBot";
import DataView from "../components/dataview/DataView";
import FileUpload from "../components/fileupload/FileUpload";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import ProfileUploader from "../components/ProfileUploader/ProfileUploader";
import VideoUploadComponent from "../components/VideoUploadComponent/videoUploadComponent";
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
  // const chartProps = {
  //   labels: ["00:00", "00:10", "00:20", "00:30", "00:40"],
  //   data: [65, 59, 80, 81, 56],
  //   title: "Happiness Intensity",
  // };

  const chartProps = {
    labels: ["00:00", "00:10", "00:20", "00:30", "00:40"],
    datasets: [
      {
        label: "Happiness",
        data: [65, 59, 80, 81, 56],
        borderColor: "#00ff00",
        tension: 0.1,
      },
      {
        label: "Sadness",
        data: [45, 49, 30, 51, 76],
        borderColor: "#ff0000",
        tension: 0.1,
      },
    ],
    title: "Emotion Intensity",
    yLabel: "Intensity",
    xLabel: "Time",
  };

  return (
    <>
      {/* <div className="layout-container">
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
      </div> */}

      <div className="container-fluid  d-flex flex-column vh-100 ash-bg">
        <div className="row">
          <div className="col-12 text-center pb-2 header pt-3 pb-3">
            {/* <img src={require("./img/logo.png")} className="logo" /> */}
            <div>
              <h3>NeuroNest</h3>
            </div>
            <div>Digital Space for Neurodivergent</div>
          </div>
          <div className="col-12 ash-white">
            {/* Input Data Container */}
            <ProfileUploader />
          </div>
        </div>

        <div className="row flex-grow-1 mt-2 mb-2">
          <div className="col-4 h-100 ash-white info-cont-left">
            <div className="col-12 h-100 d-flex flex-column">
              <div className="flex-grow-1">
                <ImageUploader />
              </div>
              <div className="flex-grow-1 ">Audio Input</div>
            </div>
          </div>
          <div className="col-4 ash-white info-cont-center">
            Video Input & Graph
            <div>
              <VideoUploadComponent />
            </div>
            <div>
              <Chart {...chartProps} />
            </div>
          </div>
          <div className="col-4 ash-white info-cont-right">Chat - BedRock</div>
        </div>
        <div className="row">
          <div className="col-12 pt-2 pb-2 footer">Powered By Neuronauts</div>
        </div>
      </div>
    </>
  );
};

export default Layout;
