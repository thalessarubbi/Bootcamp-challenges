const formatValue = (value: number): string =>
  Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );

export default formatValue;
