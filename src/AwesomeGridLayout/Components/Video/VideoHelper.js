import React from "react";

export function getVideoObject (videoType, data) {
    switch (videoType.toLowerCase()) {
        case "aparat":
            return(
                <>
                    <style>
                        {`.h_iframe-aparat_embed_frame{position:relative; width: 100%; height: 100%}.h_iframe-aparat_embed_frame
                        .ratio{display:block;width:100%;height:auto;}.h_iframe-aparat_embed_frame
                        iframe{position:absolute;top:0;left:0;width:100%;height:100%; border: none;}`}
                    </style>

                    <div className="h_iframe-aparat_embed_frame">
                        <span style={{display: "block", paddingTop: "57%"}}></span>
                        <iframe src={
                            data.embedUrl? data.embedUrl :
                            "https://www.aparat.com/video/video/embed/videohash/3bQnk/vt/frame"
                        }
                                title="پنج ترین 36: معرفی پنج بازی رومیزی برای موبایل" allowFullScreen={true}
                                webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
                    </div>
                 </>
            )
    }

    return null;
}
