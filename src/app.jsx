import { useEffect, useState, useRef } from "preact/hooks";
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

// Dimensions
const DocW = 1000/2;
const DocH = 1000/2;
const initialCropy = 117/2;
const initialCropx = 150/2;
const CropH = 736/2;
const CropW = 736/2;

export function App(props) {
  const fileInputRef = useRef(document.createElement("input"));
  const bg = useRef(new Image());
  const [cropVis, setCropVis] = useState(false);
  const [bgLoadStatus, setBgLoadStatus] = useState(false);
  const [croppedImg, setCroppedImg] = useState(null);
  const [croppedImgStatus, setCroppedImgStatus] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [previewAct, setPreviewAct] = useState(false);
  const [position, setPosition] = useState({ x: initialCropx, y: initialCropy });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Initialize background image
  useEffect(() => {
    bg.current.src = "./frame.png";
    bg.current.onload = () => setBgLoadStatus(true);
    
    fileInputRef.current.type = "file";
    fileInputRef.current.accept = "image/*";
  }, []);

  // Handle cropped image load
  useEffect(() => {
    if (!croppedImg) return;
    
    const img = new Image();
    img.src = croppedImg;
    img.onload = () => {
      setCroppedImgStatus(true);
      drawImage(img);
    };
  }, [croppedImg]);

  const drawImage = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = DocW;
    canvas.height = DocH;
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, DocW, DocH);
    
    // Save the context state
    ctx.save();
    
    // Move to center, rotate, then move back
    ctx.translate(position.x + CropW/2, position.y + CropH/2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    
    // Draw the image centered
    ctx.drawImage(
      img, 
      -CropW/2, 
      -CropH/2, 
      CropW, 
      CropH
    );
    
    // Restore the context state
    ctx.restore();
    
    // Draw the frame over the image
    if (bgLoadStatus) {
      ctx.drawImage(bg.current, 0, 0, DocW, DocH);
    }
    
    setGeneratedData(canvas.toDataURL("image/jpeg"));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropVis(true);
      setTimeout(() => initCroppie(event.target.result), 100);
    };
    reader.readAsDataURL(file);
  };

  const initCroppie = (imgSrc) => {
    const croppieElement = document.getElementById("croppie-container");
    if (!croppieElement) return;

    croppieElement.innerHTML = '';
    
    const c = new Croppie(croppieElement, {
      url: imgSrc,
      enableOrientation: true,
      enableExif: true,
      viewport: {
        width: CropW,
        height: CropH,
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

    window.currentCroppie = c;
  };

  const handlePositionChange = (axis, value) => {
    setPosition(prev => {
      const newPos = {...prev, [axis]: prev[axis] + value};
      if (croppedImgStatus) {
        const img = new Image();
        img.src = croppedImg;
        drawImage(img);
      }
      return newPos;
    });
  };

  const handleScaleChange = (value) => {
    setScale(prev => {
      const newScale = Math.max(0.1, Math.min(prev + value, 3));
      if (croppedImgStatus) {
        const img = new Image();
        img.src = croppedImg;
        drawImage(img);
      }
      return newScale;
    });
  };

  const handleRotate = (degrees) => {
    setRotation(prev => {
      const newRotation = prev + degrees;
      if (croppedImgStatus) {
        const img = new Image();
        img.src = croppedImg;
        drawImage(img);
      }
      return newRotation;
    });
  };

  const handleCrop = () => {
    if (!window.currentCroppie) return;
    
    window.currentCroppie.result({
      type: 'canvas',
      size: 'viewport',
      format: 'jpeg',
      quality: 0.9
    }).then((result) => {
      setCroppedImg(result);
      setCropVis(false);
      window.currentCroppie.destroy();
      window.currentCroppie = null;
    });
  };

  return (
    <>
      <div
        style={{ backgroundImage: `url(${bg.current.src})` }}
        className="Header"
      ></div>
      
      <div className="Cont">
        <h1>Upload photo</h1>
        
        <div className="Actions">
          <button onClick={() => fileInputRef.current.click()}>
            <AiOutlineCamera size="30" />
            <span>Upload Photo</span>
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {generatedData && (
          <div className="GetAct">
            <a href={generatedData} download="custom-poster">
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

        {croppedImg && (
          <div className="position-controls">
            <h3>Adjust Position:</h3>
            <div className="control-group">
              <button onClick={() => handlePositionChange('y', -5)}>
                <AiOutlineArrowUp />
              </button>
            </div>
            <div className="control-group horizontal">
              <button onClick={() => handlePositionChange('x', -5)}>
                <AiOutlineArrowLeft />
              </button>
              <button onClick={() => handlePositionChange('x', 5)}>
                <AiOutlineArrowRight />
              </button>
            </div>
            <div className="control-group">
              <button onClick={() => handlePositionChange('y', 5)}>
                <AiOutlineArrowDown />
              </button>
            </div>
            
            <h3>Adjust Scale:</h3>
            <div className="control-group">
              <button onClick={() => handleScaleChange(0.1)}>
                <AiOutlineZoomIn />
                <span>Zoom In</span>
              </button>
              <button onClick={() => handleScaleChange(-0.1)}>
                <AiOutlineZoomOut />
                <span>Zoom Out</span>
              </button>
            </div>
            
            <h3>Adjust Rotation:</h3>
            <div className="control-group">
              <button onClick={() => handleRotate(-15)}>
                <AiOutlineRotateLeft />
                <span>Rotate Left</span>
              </button>
              <button onClick={() => handleRotate(15)}>
                <AiOutlineRotateRight />
                <span>Rotate Right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {previewAct && (
        <div className="preview" onClick={() => setPreviewAct(false)}>
          <img src={generatedData} alt="Preview" />
        </div>
      )}

      {cropVis && (
        <div className="cropper-modal visible">
          <div className="cropper-header">
            <h2>Adjust Your Photo</h2>
            <button onClick={() => { 
              window.currentCroppie?.destroy();
              setCropVis(false); 
            }}>
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div id="croppie-container" className="cropper-container"></div>

          <div className="cropper-controls">
            <button onClick={handleCrop}>
              <AiOutlineScissor size={20} />
              <span>Crop & Apply</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
