
import﻿ styled from '@emotion/styled';

const Head = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    padding: 8px 12px;
  }
`;

const Table = styled.table`
  width: 100%;
  border: 1px solid #000;
  border-collapse: collapse;
  margin-top: 12px;

  thead {
    white-space: pre-wrap;
    th {
      padding: 8px 0;
    }
  }

  tbody {
    text-align: center;
  }

  th,
  td {
    border: 1px solid #000;
  }
`;


export { Head, Table };