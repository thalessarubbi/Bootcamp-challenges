import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  OrderConfirmed,
  OrderConfirmedText,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

interface Order extends Food {
  product_id: number;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  const { id: foodId } = routeParams;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      const response = await api.get<Food>(`/foods/${foodId}`);

      setFood({
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      });
      setExtras(
        response.data.extras.map(extra => ({
          ...extra,
          quantity: 0,
        })),
      );
    }
    async function loadFavorites(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      const response = await api.get<Food[]>('/favorites');

      setIsFavorite(!!response.data.find(favorite => favorite.id === foodId));
    }

    loadFood();
    loadFavorites();
  }, [foodId]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const extra = extras.find(ext => ext.id === id);

    if (extra) {
      extra.quantity += 1;
    }

    setExtras([...extras]);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const extra = extras.find(ext => ext.id === id);

    if (extra && extra.quantity > 0) {
      extra.quantity -= 1;
    }

    setExtras([...extras]);
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    let quantity = foodQuantity;

    setFoodQuantity((quantity += 1));
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    let quantity = foodQuantity;

    quantity > 1 && setFoodQuantity((quantity -= 1));
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    if (isFavorite) {
      try {
        await api.delete(`/favorites/${foodId}`);
        setIsFavorite(false);
      } catch {
        Alert.alert('Erro ao desfavoritar');
      }
    } else {
      try {
        await api.post(`/favorites`, { ...food });
        setIsFavorite(true);
      } catch {
        Alert.alert('Erro ao favoritar');
      }
    }
  }, [isFavorite, foodId, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
    const extrasPrice = extras.reduce((acumulator, currentExtra) => {
      return +acumulator + +currentExtra.value * currentExtra.quantity;
    }, 0);

    const totalPrice = formatValue(extrasPrice + food.price * foodQuantity);

    return totalPrice;
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
    try {
      const results = [];
      const order: Order = { ...food, product_id: food.id };
      delete order.id;
      delete order.image_url;
      delete order.formattedPrice;

      for (let i = 0; i < foodQuantity; i++) {
        results.push(api.post('/orders', order));
      }
      await Promise.all(results);
      navigation.navigate('OrderConfirmedModal');
    } catch {
      Alert.alert('Erro ao finalizar pedido');
    }
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <>
      <Container>
        <Header />

        <ScrollContainer>
          <FoodsContainer>
            <Food>
              <FoodImageContainer>
                <Image
                  style={{ width: 327, height: 183 }}
                  source={{
                    uri: food.image_url,
                  }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{food.name}</FoodTitle>
                <FoodDescription>{food.description}</FoodDescription>
                <FoodPricing>{food.formattedPrice}</FoodPricing>
              </FoodContent>
            </Food>
          </FoodsContainer>
          <AdditionalsContainer>
            <Title>Adicionais</Title>
            {extras.map(extra => (
              <AdittionalItem key={extra.id}>
                <AdittionalItemText>{extra.name}</AdittionalItemText>
                <AdittionalQuantity>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="minus"
                    onPress={() => handleDecrementExtra(extra.id)}
                    testID={`decrement-extra-${extra.id}`}
                  />
                  <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                    {extra.quantity}
                  </AdittionalItemText>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="plus"
                    onPress={() => handleIncrementExtra(extra.id)}
                    testID={`increment-extra-${extra.id}`}
                  />
                </AdittionalQuantity>
              </AdittionalItem>
            ))}
          </AdditionalsContainer>
          <TotalContainer>
            <Title>Total do pedido</Title>
            <PriceButtonContainer>
              <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
              <QuantityContainer>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={handleDecrementFood}
                  testID="decrement-food"
                />
                <AdittionalItemText testID="food-quantity">
                  {foodQuantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={handleIncrementFood}
                  testID="increment-food"
                />
              </QuantityContainer>
            </PriceButtonContainer>

            <FinishOrderButton onPress={() => handleFinishOrder()}>
              <ButtonText>Confirmar pedido</ButtonText>
              <IconContainer>
                <Icon name="check-square" size={24} color="#fff" />
              </IconContainer>
            </FinishOrderButton>
          </TotalContainer>
        </ScrollContainer>
      </Container>
    </>
  );
};

export default FoodDetails;
