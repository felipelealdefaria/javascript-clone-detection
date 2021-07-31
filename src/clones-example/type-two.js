export const arrowTwo = (op, valueOne, valueTwo) => {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (op === 'sum') {
    return valueOne + valueTwo
  } else {
    return valueOne - valueTwo
  }
}

export function regularTwo (state, vOne, vTwo) {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (state === 'sum') {
    return vOne + vTwo
  } else {
    return vOne - vTwo // subtract the values
  }
}

export const InputGroup = styled.div`
  width: 100%;
  display: flex;
  margin: 35px 0 15px 20px;
  align-items: center;
  justify-content: flex-start;
  > svg {
    color: ${colors.grey};
  }
  > input {
    border: none;
    width: 195px;
    color: ${colors.grey};
    font-size: 13px;
    margin: 0px 10px;
    padding: 2px 8px;
    border-bottom: 1px solid #dcdcdc;
    ::placeholder {
      opacity: 0.8;
    }
    :disabled {
      opacity: 0.8;
      cursor: pointer;
      background-color: transparent;
    }
    :focus {
      outline: none;
    }
  }
  > p {
    color: ${colors.grey};
    margin: 0 10px;
    font-size: 13px;
    padding: 2px 8px;
    border-bottom: 1px solid #dcdcdc;
  }
  > button {
    color: ${colors.primaryGreen};
    cursor: pointer;
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 25px;
    border: ${colors.primaryGreen};
    background-color: transparent;
    :hover {
      color: ${colors.white};
      background-color: ${colors.primaryGreen};
    }
    :focus {
      outline: none;
    }
  }
  /* loading and sucess icon */
  > span svg {
    width: 20px;
    height: 20px;
    color: #0e9d7a;
  }
  /* fail icon */
  > span.fail svg {
    color: #f11515;
    cursor: pointer;
    animation: bounce 2s 1;
    :hover {
      opacity: 0.7;
    }
  }
`;

function funcaoSemEXPORT (state, vOne, vTwo) {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (state === 'sum') {
    return vOne + vTwo
  } else {
    return vOne - vTwo // subtract the values
  }
}

const arrowSemEXPORT =  (state, vOne, vTwo) => {
  // this function aims to verify if
  // operation is equal sum and perform it
  if (state === 'sum') {
    return vOne + vTwo
  } else {
    return vOne - vTwo // subtract the values
  }
}