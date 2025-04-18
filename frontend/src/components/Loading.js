import React from 'react';

const loaderGif = "https://cdn.dribbble.com/userupload/23755712/file/original-5943ff95835c4f5de7d6ca4d3586cffc.gif";

const Loading = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center h-screen">
      <img src={loaderGif} alt="Loading..." className="w-80 h-64" />
      <div className="my-48">
        <p className="-my-64 text-3xl text-gray-600 font-sans animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;
