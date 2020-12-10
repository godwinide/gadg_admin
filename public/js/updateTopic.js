const form = document.querySelector("#filesForm");

const upload = e => {
    e.preventDefault();
    const pdf = form.querySelector("#pdf");
    const audio = form.querySelector("#audio");
    const video = form.querySelector("#video");
    const courseID = form.querySelector("#courseID"); 
    const topicID = form.querySelector("#topicID"); 
    const pdf_file = pdf.files[0];
    const audio_file = audio.files[0];
    const video_file = video.files[0] || '';

    const uploadBtn = document.querySelector("#uploadBtn");
    uploadBtn.style.display="none"
    const uploadMsg = document.querySelector("#uploadMsg");
    uploadMsg.innerText="uploading course files to server";;

    const formData = new FormData();
    formData.append("pdf", pdf_file)
    formData.append("audio", audio_file)
    if(video)formData.append("video", video_file)
    formData.append("titleSlug", courseID.value.split(" ")[0]);
    formData.append("id", topicID.value.split(" ")[0]);

    const clearAll = () => {
        document.querySelector("#progressBar").style.width = "0%";
        const warningWrap = document.querySelector("#warningWrap");
        const uploadBtn = document.querySelector("#uploadBtn");
        const uploadMsg = document.querySelector("#uploadMsg")
        warningWrap.innerHTML = "";
        uploadMsg.innerText = "";
        uploadBtn.style.display = "block";
    }

    const config = {
        headers:{
            'Content-type': 'application/json'
        },
        onUploadProgress: function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          document.querySelector("#progressBar").style.width = Math.floor(percentCompleted) + "%";
          if(percentCompleted > 99){
                uploadMsg.innerText="uploading course files to AWS";;
          }
        }
      }
    
    axios.post("/editTopic/files", formData, config)
      .then(res => {
        clearAll()
        form.reset();
        document.querySelector("#warningWrap").innerHTML = `
        <div class="alert alert-success" role="alert">
            ${res.data.msg}
        </div>
      `;
      })
      .catch(err => {
          clearAll();
          document.querySelector("#warningWrap").innerHTML = `
          <div class="alert alert-warning" role="alert">
              ${err.response.data.errors[0].msg}
          </div>
        `;
          uploadBtn.style.display="block";
      })
}

form.addEventListener("submit", upload);
