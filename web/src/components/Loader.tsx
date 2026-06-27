import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader-container">
        <div className="loader" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
    }

    50% {
      transform: rotate(180deg);
      box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
    }

    100% {
      transform: rotate(360deg);
      box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.4);
    }
  }`;

export default Loader;
