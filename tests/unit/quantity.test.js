const { increaseValue, decreaseValue } = require('../../js/custom.js');

function makeInput(val) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = String(val);
  return input;
}

describe('increaseValue', () => {
  test('increments a valid integer by 1', () => {
    const input = makeInput(3);
    increaseValue(null, input);
    expect(input.value).toBe('4');
  });

  test('increments from 0 to 1', () => {
    const input = makeInput(0);
    increaseValue(null, input);
    expect(input.value).toBe('1');
  });

  test('treats NaN input as 0 and increments to 1', () => {
    const input = makeInput('abc');
    increaseValue(null, input);
    expect(input.value).toBe('1');
  });

  test('treats empty string as 0 and increments to 1', () => {
    const input = makeInput('');
    increaseValue(null, input);
    expect(input.value).toBe('1');
  });

  test('handles a large value correctly', () => {
    const input = makeInput(99);
    increaseValue(null, input);
    expect(input.value).toBe('100');
  });
});

describe('decreaseValue', () => {
  test('decrements a valid integer by 1', () => {
    const input = makeInput(3);
    decreaseValue(null, input);
    expect(input.value).toBe('2');
  });

  test('decrements 1 to 0', () => {
    const input = makeInput(1);
    decreaseValue(null, input);
    expect(input.value).toBe('0');
  });

  test('does not go below 0 when value is already 0', () => {
    const input = makeInput(0);
    decreaseValue(null, input);
    expect(input.value).toBe('0');
  });

  test('treats NaN input as 0 and stays at 0', () => {
    const input = makeInput('xyz');
    decreaseValue(null, input);
    expect(input.value).toBe('0');
  });

  test('treats empty string as 0 and stays at 0', () => {
    const input = makeInput('');
    decreaseValue(null, input);
    expect(input.value).toBe('0');
  });
});

describe('multiple quantity containers - independent state', () => {
  function makeContainer(initialValue) {
    const container = document.createElement('div');
    container.className = 'quantity-container';

    const decrease = document.createElement('button');
    decrease.className = 'decrease';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'quantity-amount';
    input.value = String(initialValue);

    const increase = document.createElement('button');
    increase.className = 'increase';

    container.appendChild(decrease);
    container.appendChild(input);
    container.appendChild(increase);
    return container;
  }

  test('increasing one container does not affect another', () => {
    const input1 = makeContainer(2).querySelector('.quantity-amount');
    const input2 = makeContainer(5).querySelector('.quantity-amount');

    increaseValue(null, input1);

    expect(input1.value).toBe('3');
    expect(input2.value).toBe('5');
  });

  test('decreasing one container does not affect another', () => {
    const input1 = makeContainer(4).querySelector('.quantity-amount');
    const input2 = makeContainer(1).querySelector('.quantity-amount');

    decreaseValue(null, input1);

    expect(input1.value).toBe('3');
    expect(input2.value).toBe('1');
  });

  test('interleaved operations on two containers stay independent', () => {
    const input1 = makeContainer(1).querySelector('.quantity-amount');
    const input2 = makeContainer(3).querySelector('.quantity-amount');

    increaseValue(null, input1); // input1 → 2
    decreaseValue(null, input2); // input2 → 2
    increaseValue(null, input1); // input1 → 3
    decreaseValue(null, input2); // input2 → 1

    expect(input1.value).toBe('3');
    expect(input2.value).toBe('1');
  });
});
