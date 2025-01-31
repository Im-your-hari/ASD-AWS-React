import { useState } from "react";
import Chart from "../components/chart/Chart";
import ChatBot from "../components/chatbot/ChatBot";
import DataView from "../components/dataview/DataView";
import FileUpload from "../components/fileupload/FileUpload";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import ProfileUploader from "../components/ProfileUploader/ProfileUploader";
import VideoUploadComponent from "../components/VideoUploadComponent/videoUploadComponent";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import "./Layout.css";
import Textract from "../components/textract/Textract";
import Transcribe from "../components/transcribe/Transcribe";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
    setResponseData({name: 'roshith2', dob: '01/01/2020'});
  };

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

  const handleViewFile = (fileName: string) => {
    console.log("Viewing file:", fileName);
    // setSelectedFile(fileName);
    // // You can now navigate to a different page, open a modal, etc.
  };

  return (
    <>
      <div className="container-fluid d-flex flex-column vh-100 ash-bg">
        {/* Header */}
        <div className="row">
          <div className="col-12 text-center pb-2 header pt-3 pb-3">
            <h3>NeuroNest</h3>
            <div>Digital Space for Neurodivergent</div>
          </div>

          {/* Textract (File Processing) */}
          <div className="col-12 ash-white">
            <Textract onExtractComplete={setResponseData} />
          </div>
        </div>

        {/* Show content only if responseData is available */}
        {responseData && (
          <>
            {/* Main Content */}
            <div className="row flex-grow-1 mt-2 mb-2">
              {/* Left Panel */}
              <div className="col-4 h-100 ash-white info-cont-left">
                <div className="col-12 h-100 d-flex flex-column">
                  <div className="flex-grow-1">
                    <ImageUploader responseData={responseData} />
                  </div>
                  <div className="flex-grow-1">
                    <Transcribe />
                  </div>
                </div>
              </div>

              {/* Center Panel */}
              <div className="col-8 ash-white info-cont-center">
                <div>
                  <VideoUploadComponent responseData={responseData} onViewFile={handleViewFile} />
                </div>
                <hr color="#c0c0c0" />
                <h2 className="mb-4">Graph</h2>
                <div>
                  <Chart {...chartProps} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chat Drawer */}
        <div className={`chat-drawer-container ${isOpen ? "open" : ""}`}>
          <Drawer
            open={isOpen}
            onClose={toggleDrawer}
            direction="right"
            className="chat-drawer"
            size={550}
          >
            <div className="chat-container">
              <ChatBot />
            </div>
          </Drawer>
        </div>

        {/* Chat Button */}
        <button className="chat-button" onClick={toggleDrawer}>
          Chat
        </button>

        {/* Footer */}
        <div className="row">
          <div className="col-12 pt-2 pb-2 footer">Powered By Neuronauts</div>
        </div>
      </div>
    </>
  );
};

export default Layout;
