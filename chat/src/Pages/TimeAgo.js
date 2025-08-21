import React, { useState, useEffect } from "react";

function TimeAgo({ dateString }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const update = () => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // seconds

      if (diff < 60) setTimeAgo(`${diff}s ago`);
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      else {
        setTimeAgo(
          date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      }
    };

    update(); // run immediately
    const interval = setInterval(update, 1000); // update every second

    return () => clearInterval(interval); // cleanup on unmount
  }, [dateString]);

  return <span>{timeAgo}</span>;
}

export default TimeAgo;
