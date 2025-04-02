// import React, { useRef, useState, useEffect } from "react";
// import Croppie from "croppie";
// import "croppie/croppie.css";

// const ImageCropper = ({ onCrop, onCancel }) => {
//   const croppieRef = useRef(null);
//   const [croppie, setCroppie] = useState(null);
//   const [file, setFile] = useState(null);

//   useEffect(() => {
//     if (croppieRef.current && !croppie) {
//       const newCroppie = new Croppie(croppieRef.current, {
//         viewport: { width: 200, height: 200, type: "square" },
//         boundary: { width: 300, height: 300 },
//         showZoomer: true,
//       });
//       setCroppie(newCroppie);
//     }
//   }, [croppie]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);
//     const reader = new FileReader();
//     reader.onload = (event) => {
//       croppie.bind({ url: event.target.result });
//     };
//     reader.readAsDataURL(selectedFile);
//   };

//   const handleCrop = () => {
//     croppie.result({ type: "base64", size: "viewport" }).then((croppedImage) => {
//       onCrop(croppedImage);
//       setFile(null);
//     });
//   };

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={handleFileChange} />
//       {file && (
//         <div>
//           <div ref={croppieRef}></div>
//           <button onClick={handleCrop}>Crop Image</button>
//           <button onClick={() => setFile(null)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageCropper;
