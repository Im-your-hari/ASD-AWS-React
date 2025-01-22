import { ChangeEvent, useState } from "react";
import MultipartUpload from "../Methods/MultipartUpload";

const FileUpload = () => {
  // const [file, setFile] = useState<File>();

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   let files;
  //   if (e.target.files) {
  //     files = e.target.files[0];
  //     console.log("file change", e.target.files[0]);
  //     setFile(files);
  //   }
  // };

  // const handleUpload = () => {
  //   console.log("File-upload : ", file);
  // };

  return (
    <>
      <p>FileUploader component</p>

      {/* <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {file && <p>{file.name}</p>} */}

<div className="App">
      <h1>Chunked File Upload to S3</h1>
      <MultipartUpload />
    </div>
    </>
  );
};

export default FileUpload;
