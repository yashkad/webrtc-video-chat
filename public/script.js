const videoGrid = document.getElementById("video-grid");
const userId = document.getElementById("user-id");

const peer = new Peer();
const socket = io("/");

const calledUsers = {};

peer.on("open", (id) => {
  socket.emit("join-room", {
    roomId: ROOM_ID,
    userId: id,
  });
});

const addVideoToScreen = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", (e) => {
    video.play();
  });
  videoGrid.append(video);
};

const RUN = () => {
  const myVideo = document.createElement("video");
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      addVideoToScreen(myVideo, stream);

      socket.on("user-connected", (id) => {
        connectToNewUser(id, stream);
      });

      peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (stream) => {
          addVideoToScreen(video, stream);
        });
      });
    })
    .catch((e) => console.log("Error : ", e));
};

const connectToNewUser = (id, stream) => {
  const call = peer.call(id, stream);
  const video = document.createElement("video");
  call.on("stream", (stream) => {
    addVideoToScreen(video, stream);
  });

  call.on("close", () => {
    video.remove();
  });

  calledUsers[id] = call;
};

socket.on("user-disconnected", (id) => {
  if (calledUsers[id]) calledUsers[id].close();

  console.log("calledUsers", calledUsers);
});

RUN();
