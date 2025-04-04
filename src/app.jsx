import { useEffect, useState } from "preact/hooks";
import {
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineDownload,
  AiOutlineScissor,
  AiOutlineRotateLeft,
  AiOutlineRotateRight,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineArrowRight
} from "react-icons/ai";
import "croppie/croppie.css";
import "./style.scss";
import Croppie from "croppie";

let CropArea = document.createElement("div");
let c; // Croppie instance
let bg = new Image();

// Dimensions
let DocW = 1000/2;
let DocH = 1000/2;
let Cropy = 117/2;
let Cropx = 150/2;
let CropH = 736/2;
let CropW = 736/2;

export function App(props) {
  let file = document.createElement("input");
  const [cropVis, setcropVis] = useState(false);
  const [BgLoadStatus, setBgLoadStatus] = useState(null);
  const [CroppedImg, setCroppedImg] = useState(null);
  const [CroppedImgStatus, setCroppedImgStatus] = useState(null);
  const [GeneratedData, setGeneratedData] = useState(null);
  const [PreviewAct, setPreviewAct] = useState(null);
  const [Name, setName] = useState(null);

  // Initialize background image
  bg.src = "./frame.png";
  bg.onload = () => {
    setBgLoadStatus(1);
  };

  // Handle cropped image load
  let CroppedImgTag = new Image();
  CroppedImgTag.src = CroppedImg;
  CroppedImgTag.onload = () => {
    setCroppedImgStatus(1);
  };

  // Canvas setup
  let _canv = document.createElement("canvas");
  let _ctx = _canv.getContext("2d");
  _canv.width = DocW;
  _canv.height = DocH;

  useEffect(() => {
    draw();
  }, [CroppedImgStatus]);

  function draw() {
    if (BgLoadStatus && CroppedImgStatus) {
      _ctx.clearRect(0, 0, DocW, DocH);
      _ctx.drawImage(CroppedImgTag, Cropx, Cropy, CropW, CropH);
      _ctx.drawImage(bg, 0, 0, DocW, DocH);
      setGeneratedData(_canv.toDataURL("image/jpeg"));
    }
  }

  // File input setup
  file.type = "file";
  file.accept = "image/*";
  let Img;
  file.onchange = () => {
    let _file = file.files[0];
    if (!_file) return;

    let fileReader = new FileReader();
    fileReader.readAsDataURL(_file);
    fileReader.onload = () => {
      Img = fileReader.result;
      Crop();
    };
  };

  function Crop() {
    setcropVis(true);
    setTimeout(() => {
      c = new Croppie(CropArea, {
        url: Img,
        enableOrientation: true,
        enableExif: true,
        viewport: {
          height: CropH,
          width: CropW,
          type: "circle"
        },
        boundary: {
          width: Math.min(window.innerWidth - 40, 600),
          height: Math.min(window.innerHeight - 200, 600)
        },
        showZoomer: true,
        enableZoom: true,
        enableResize: true,
        mouseWheelZoom: 'ctrl'
      });
    }, 100);
  }

  function Preview() {
    return (
      <>
        {PreviewAct && (
          <div
            onClick={() => setPreviewAct(false)}
            className="preview"
          >
            <img src={GeneratedData} alt="Preview" />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div
        style={{ backgroundImage: `url(${bg.src ? bg.src : ""})` }}
        className="Header"
      ></div>
      <div className="Cont">
        <h1>Upload photo</h1>
        <div className="Actions">
          <button onClick={() => file.click()}>
            <AiOutlineCamera size="30" />
            <span>Upload Photo</span>
          </button>
        </div>

        {GeneratedData && (
          <div className="GetAct">
            <a href={GeneratedData} download="custom-poster">
              <button>
                <AiOutlineDownload size="40" />
                <span>Download</span>
              </button>
            </a>
            <button onClick={() => setPreviewAct(true)}>
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      <Preview />
      <Cropper
        setCroppedImg={setCroppedImg}
        visible={cropVis}
        set={setcropVis}
      />
    </>
  );
}

function Cropper({ visible, set, setCroppedImg }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoom = (direction) => {
    const factor = direction === 'in' ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(zoom * factor, 3));
    setZoom(newZoom);
    c.setZoom(newZoom);
  };

  const handleRotate = (degrees) => {
    const newRotation = rotation + degrees;
    setRotation(newRotation);
    c.rotate(newRotation);
  };

  const handleCrop = () => {
    c.result({
      type: 'canvas',
      size: 'viewport',
      format: 'jpeg',
      quality: 0.9
    }).then((result) => {
      setCroppedImg(result);
      set(false);
      c.destroy();
    });
  };

  return (
    <div className={`cropper-modal ${visible ? "visible" : "hidden"}`}>
      <div className="cropper-header">
        <h2>Adjust Your Photo</h2>
        <button onClick={() => { c?.destroy(); set(false); }}>
          <AiOutlineClose size={24} />
        </button>
      </div>

      <div
        ref={(e) => {
          if (e) {
            e.innerHTML = "";
            e.appendChild(CropArea);
          }
        }}
        className="cropper-container"
      ></div>

      <div className="cropper-controls">
        <div className="control-group">
          <button onClick={() => handleZoom('in')}>
            <AiOutlineZoomIn size={20} />
          </button>
          <button onClick={() => handleZoom('out')}>
            <AiOutlineZoomOut size={20} />
          </button>
        </div>

        <div className="control-group">
          <button onClick={() => handleRotate(-90)}>
            <AiOutlineRotateLeft size={20} />
          </button>
          <button onClick={() => handleRotate(90)}>
            <AiOutlineRotateRight size={20} />
          </button>
        </div>

        <div className="control-group">
          <button onClick={handleCrop}>
            <AiOutlineScissor size={20} />
            <span>Crop & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
