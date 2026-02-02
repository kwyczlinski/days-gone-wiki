import React from 'react';

export const Comment = ({ username, content, posted, edited }) => {
  return (
    <div>
      <div >
        <span >{username}</span>
        <span >
          {new Date(posted).toLocaleString()}
          {edited && <span> (edited)</span>}
        </span>
      </div>
      <div>{content}</div>
    </div>
  );
};