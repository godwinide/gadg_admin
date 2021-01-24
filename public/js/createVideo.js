const form = document.querySelector("#filesForm2");

const upload = e => {
    e.preventDefault();
    const thumbnail = form.querySelector("#thumbnail");
    const video = form.querySelector("#video");
    const share = form.querySelector("#share");
    const price = form.querySelector("#price");
    const courseID = form.querySelector("#courseID"); 
    const topicID = form.querySelector("#topicID");
    const lecturerID = form.querySelector("#lecturerID");
    const thumbnail_file = thumbnail.files[0];
    const video_file = video.files[0] || '';

    const uploadBtn = document.querySelector("#uploadBtn");
    uploadBtn.style.display="none"
    const uploadMsg = document.querySelector("#uploadMsg");
    uploadMsg.innerText="uploading course files to server";;

    const formData = new FormData();
    formData.append("thumbnail", thumbnail_file)
    if(video)formData.append("video", video_file)
    formData.append("courseID", courseID.value.split(" ")[0]);
    formData.append("topicID", topicID.value.split(" ")[0]);
    formData.append("lecturerID", lecturerID.value.split(" ")[0]);
    formData.append("price", price.value.split(" ")[0]);
    formData.append("share", share.value.split(" ")[0]);

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
    
    axios.post("/lecturers/createLecturerVideo", formData, config)
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
