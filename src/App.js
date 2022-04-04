import React, { Component } from "react";
import { Overlay } from "react-bootstrap";
import TextareaAutosize from "react-textarea-autosize";
import request from "./helpers/request";
import Pusher from "pusher-js";
import {
  URL_API,
  PUSHER_KEY,
  PUSHER_CLUSTER,
  CHANNEL_DEFAULT,
} from "./configs/keys";
import { getID, setID } from "./helpers/cookies";

import "./App.css";

export default class FloatButton extends Component {
  targetRef = React.createRef();
  messagesEndRef = React.createRef();

  constructor() {
    super();
    this.state = {
      link: "https://wa.me/6285574719488",
      openInfo: true,
      showLiveChat: false,
      message: "",
      allChats: [],
      chats: [],
      idSaved: "",
      showPopover: false,
    };
  }

  componentDidMount() {
    this.getChats();

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(CHANNEL_DEFAULT);

    channel.bind(`webchat-${getID()}`, (data) => {
      this.setState({
        allChats: [
          ...this.state.allChats,
          { from: "bot", message: data.message, type: "text" },
        ],
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.allChats !== this.state.allChats) {
      this.scrollToBottom();
    }
    if (prevState.showLiveChat !== this.state.showLiveChat) {
      this.scrollToBottom();
    }
  }

  getChats() {
    let idSaved = getID();

    if (!idSaved) {
      const uniqueId = () => parseInt(Date.now() * Math.random()).toString();
      setID(uniqueId());
      idSaved = getID();
    }

    const res = request.get(`${URL_API}/webchat/chats/${idSaved}`);
    res.then((val) => {
      this.setState({
        allChats: [...this.state.allChats, ...val.data.data.chats],
      });
    });

    this.scrollToBottom();
    const chats = localStorage.getItem("chat");
    this.setState({ chats: [...this.state.chats, chats], idSaved: idSaved });
  }

  linkTo() {
    const { link } = this.state;
    // window.location.href = link;
    window.open(link, "_blank");
  }

  //Chat Info Modal
  onOpenModalInfo = () => {
    this.setState({ openInfo: true });
  };

  onCloseModalInfo = () => {
    this.setState({ openInfo: false });
  };

  onShowLiveChat = () => {
    this.setState({ showLiveChat: true });
  };

  onCloseLiveChat = () => {
    this.setState({ showLiveChat: false });
  };

  onEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  };

  handleFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();

      let type = e.target.files[0].type.includes("image") ? "image" : "file";

      formData.append("actor", this.state.idSaved);
      formData.append("actor_type", "webchat");
      formData.append("file", file);

      const r = request.post(
        `${URL_API}/webhook/webchat/Ix5P4xS6NjH0owsaSRCSwyuIZCa8Qcv1ljoBVBATVHfF43VsCFzvySaSL8DwV85C`,
        formData
      );
      r.then((re) => {
        this.setState({
          allChats: [
            ...this.state.allChats,
            {
              from: "client",
              type: type,
              payload_url: re.data.data.payload.url,
            },
          ],
        });
      });
    }
  };

  send = () => {
    const data = {
      actor: this.state.idSaved,
      actor_type: "webchat",
      message_type: "text",
      message: this.state.message,
    };
    const selectCheckBox = document.getElementById("boxChat");

    const formData = new FormData();
    formData.append("actor", this.state.idSaved);
    formData.append("actor_type", "webchat");
    formData.append("message_type", "text");
    formData.append("message", this.state.message);

    this.setState({ message: "" });

    selectCheckBox.value = null;

    const r = request.post(
      `${URL_API}/webhook/webchat/Ix5P4xS6NjH0owsaSRCSwyuIZCa8Qcv1ljoBVBATVHfF43VsCFzvySaSL8DwV85C`,
      formData
    );
    r.then((res) => {
      this.setState({
        allChats: [
          ...this.state.allChats,
          { from: "client", message: data.message, type: "text" },
        ],
      });
    });
  };

  scrollToBottom = () => {
    if (
      this.messagesEndRef.current !== null &&
      this.messagesEndRef.current !== undefined
    ) {
      this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  saveToLocalStorage = (data) => {
    localStorage.setItem("chat", JSON.stringify(data));
  };

  getType = (type, i) => {
    switch (type) {
      case "image":
        return (
          <div className="file-image">
            <img src={i.payload_url} alt="image" />
          </div>
        );
      case "file":
        return (
          <div className="file-icon" onClick={() => window.open(i.payload_url)}>
            <i
              className="material-icons"
              style={{ fontSize: 80, color: "grey" }}
            >
              download
            </i>
          </div>
        );

      default:
        return <p> {i.message} </p>;
    }
  };

  render() {
    // State Info modal
    const { openInfo, showLiveChat } = this.state;

    return (
      <div className="chat-bot">
        <div
          style={{ cursor: "pointer" }}
          onClick={() => this.setState({ showLiveChat: true })}
        >
          <Icon />
        </div>
        <div className={`live-chat-container-${showLiveChat}`}>
          <div className="head-live-chat">
            <h5>Live Chat</h5>
            <div
              style={{ cursor: "pointer", width: 24 }}
              onClick={this.onCloseLiveChat}
            >
              <Icon />
            </div>
          </div>

          <div className="body-live-chat">
            {this.state.allChats?.map((i) => {
              if (i !== null) {
                switch (i.from) {
                  case "client":
                    return (
                      <div className="right-balloon">
                        {this.getType(i.type, i)}
                      </div>
                    );

                  default:
                    return (
                      <div className="left-balloon">
                        {this.getType(i.type, i)}
                      </div>
                    );
                }
              }
            })}

            <div ref={this.messagesEndRef} />
          </div>

          <div className="input-parent-live-chat">
            <div
              className="input-icon icon"
              ref={this.targetRef}
              onClick={() =>
                this.setState({ showPopover: !this.state.showPopover })
              }
              style={{ width: 22, cursor: "pointer" }}
            >
              <Emoticon />
            </div>
            <Overlay
              target={this.targetRef && this.targetRef.current}
              show={this.state.showPopover}
              placement="top"
              rootClose
              onHide={() => this.setState({ showPopover: false })}
            >
              {({ placement, arrowProps, show: _show, popper, ...props }) => (
                <div
                  {...props}
                  style={{
                    position: "absolute",
                    backgroundColor: "white",
                    padding: "7px 10px",
                    color: "black",
                    borderRadius: 3,
                    marginBottom: 15,
                    border: ".5px solid darkgrey",
                    zIndex: 99,
                    ...props.style,
                  }}
                >
                  <h6>for emoji click: </h6>
                  <h6>
                    <kbd class="keyboard-key nowrap buttonKeyboard">
                      {" "}
                      ⊞ Win{" "}
                    </kbd>{" "}
                    +<kbd class="keyboard-key nowrap buttonKeyboard"> . </kbd>
                  </h6>
                  <h6>or</h6>
                  <h6>
                    <kbd class="keyboard-key nowrap buttonKeyboard"> CTRL </kbd>{" "}
                    +<kbd class="keyboard-key nowrap buttonKeyboard"> ⌘ </kbd> +
                    <kbd class="keyboard-key nowrap buttonKeyboard">
                      {" "}
                      Space{" "}
                    </kbd>
                  </h6>
                </div>
              )}
            </Overlay>

            <TextareaAutosize
              autoComplete="off"
              id="boxChat"
              maxRows={4}
              rows={1}
              className="textarea"
              placeholder="Type a message"
              value={this.state.message}
              onChange={(e) => this.setState({ message: e.target.value })}
              data-emojiable
              onKeyPress={this.onEnter}
            />
            <div className="input-icon icon">
              <label
                htmlFor="upload-file"
                className="pointer"
                style={{ width: 20 }}
              >
                <AttachFile />
              </label>
              <input
                style={{
                  opacity: 0,
                  display: "none",
                }}
                type="file"
                id="upload-file"
                onChange={this.handleFile}
                accept="image/png, image/jpeg, image/gif, image/*, file_extension/doc, file_extension/pdf, audio/*, video/*, media_type, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf"
              />
            </div>
            <div
              className="input-icon icon"
              onClick={this.send}
              style={{ width: 20, cursor: "pointer" }}
            >
              <SendIcon />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      className="icon-fill"
      d="M256 32C112.9 32 4.563 151.1 0 288v104C0 405.3 10.75 416 23.1 416S48 405.3 48 392V288c0-114.7 93.34-207.8 208-207.8C370.7 80.2 464 173.3 464 288v104C464 405.3 474.7 416 488 416S512 405.3 512 392V287.1C507.4 151.1 399.1 32 256 32zM160 288L144 288c-35.34 0-64 28.7-64 64.13v63.75C80 451.3 108.7 480 144 480L160 480c17.66 0 32-14.34 32-32.05v-127.9C192 302.3 177.7 288 160 288zM368 288L352 288c-17.66 0-32 14.32-32 32.04v127.9c0 17.7 14.34 32.05 32 32.05L368 480c35.34 0 64-28.7 64-64.13v-63.75C432 316.7 403.3 288 368 288z"
    />
  </svg>
);

const Emoticon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      className="icon-chat"
      d="M256 352C293.2 352 319.2 334.5 334.4 318.1C343.3 308.4 358.5 307.7 368.3 316.7C378 325.7 378.6 340.9 369.6 350.6C347.7 374.5 309.7 400 256 400C202.3 400 164.3 374.5 142.4 350.6C133.4 340.9 133.1 325.7 143.7 316.7C153.5 307.7 168.7 308.4 177.6 318.1C192.8 334.5 218.8 352 256 352zM208.4 208C208.4 225.7 194 240 176.4 240C158.7 240 144.4 225.7 144.4 208C144.4 190.3 158.7 176 176.4 176C194 176 208.4 190.3 208.4 208zM304.4 208C304.4 190.3 318.7 176 336.4 176C354 176 368.4 190.3 368.4 208C368.4 225.7 354 240 336.4 240C318.7 240 304.4 225.7 304.4 208zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z"
    />
  </svg>
);

const AttachFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path
      className="icon-chat"
      d="M364.2 83.8C339.8 59.39 300.2 59.39 275.8 83.8L91.8 267.8C49.71 309.9 49.71 378.1 91.8 420.2C133.9 462.3 202.1 462.3 244.2 420.2L396.2 268.2C407.1 257.3 424.9 257.3 435.8 268.2C446.7 279.1 446.7 296.9 435.8 307.8L283.8 459.8C219.8 523.8 116.2 523.8 52.2 459.8C-11.75 395.8-11.75 292.2 52.2 228.2L236.2 44.2C282.5-2.08 357.5-2.08 403.8 44.2C450.1 90.48 450.1 165.5 403.8 211.8L227.8 387.8C199.2 416.4 152.8 416.4 124.2 387.8C95.59 359.2 95.59 312.8 124.2 284.2L268.2 140.2C279.1 129.3 296.9 129.3 307.8 140.2C318.7 151.1 318.7 168.9 307.8 179.8L163.8 323.8C157.1 330.5 157.1 341.5 163.8 348.2C170.5 354.9 181.5 354.9 188.2 348.2L364.2 172.2C388.6 147.8 388.6 108.2 364.2 83.8V83.8z"
    />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      className="icon-chat"
      d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"
    />
  </svg>
);
