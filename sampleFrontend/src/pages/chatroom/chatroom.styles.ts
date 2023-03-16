
import styled from '@emotion/styled';

const LeaveButton = styled.button`
  margin-bottom: 0.5rem;
  display: block;
  margin-left: auto;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #000;
  padding: 1rem;

  min-height: 360px;
  max-height: 600px;
  overflow: auto;

  background: #FFEAEA;
`;

const MessageBox = styled.div`
  display: flex;
  flex-direction: column;

  &.my_message {
    align-self: flex-end;

    .message {
      background: #F5FFFA;
      align-self: flex-end;
    }
  }

  &.alarm {
    align-self: center;
  }
`;

const Message = styled.span`
  margin-bottom: 0.5rem;
  background: #DC143C;
  width: fit-content;
  padding: 12px;
  border-radius: 0.5rem;
`;

const MessageForm = styled.form`
  display: flex;
  margin-top: 24px;

  input {
    flex-grow: 1;
    margin-right: 1rem;
  }
`;

export { LeaveButton, ChatContainer, MessageBox, Message, MessageForm };