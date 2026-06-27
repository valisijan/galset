import React from 'react';
import styled from 'styled-components';

const TypingIndicator = () => {
  return (
    <StyledWrapper>
      <div className="typing-indicator">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 12px;
    padding: 0 2px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background-color: #9ca3af; /* gray-400 */
    border-radius: 50%;
    display: inline-block;
    animation: wave 1.2s ease-in-out infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes wave {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-5px);
    }
  }
`;

export default TypingIndicator;
