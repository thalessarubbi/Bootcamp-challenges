import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { OrderConfirmed, OrderConfirmedText } from './styles';

const OrderConfirmedModal: React.FC = () => {
  const { navigate } = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      navigate('DashboardStack');
    }, 2000);
  }, [navigate]);

  return (
    <OrderConfirmed>
      <Icon name="thumbs-up" size={40} color="#39B100" />
      <OrderConfirmedText>Pedido confirmado!</OrderConfirmedText>
    </OrderConfirmed>
  );
};

export default OrderConfirmedModal;
