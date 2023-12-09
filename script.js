const downloadBtn = document.getElementById("download-btn");
const downloadLink = document.getElementById("download-link");
const downloadForm = document.getElementById("download-form");
const downloadURL = document.getElementById("download-url");
const closeBtn = document.getElementById("close");
const browseBtn = document.getElementById("browse-btn");
const file_upload_section = document.getElementById("file-upload-section");

function downloadFile() {
  const link = downloadLink.value;

  if(link.length < 10){
    return alert("!!! Enter Valid Link !!!")
  }

  const data = {
    link
  };

  fetch("/download", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })

  .then(data => data.json())

  .then(res => {
    if(res.status != 200){
      return alert("File Not Found")
    }

    const filepath =  `${res.filename}`
    downloadURL.href = filepath;
    downloadForm.style.display = "block";
    window.stop();
    setTimeout(deleteFile, 10000);
    function deleteFile() {

      const data = {
        filepath
      };
    
      fetch("/deletefile", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      })

      .then(resp => {
        console.log("Status : ",resp.status);
      })

    }
    window.stop()
  })
}