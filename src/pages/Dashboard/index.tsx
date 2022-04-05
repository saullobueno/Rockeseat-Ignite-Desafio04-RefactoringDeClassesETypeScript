import { useEffect, useState } from 'react';
import FoodComponent from '../../components/Food';
import Header from '../../components/Header';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import api from '../../services/api';
import { FoodsContainer } from './styles';

interface Foods {
	id: number;
	name: string;
	description: string;
	price: number;
	available: boolean;
	image: string;
}

export default function Dashboard() {
	const [foods, setFoods] = useState<Foods[]>([]);
	const [editingFood, setEditingFood] = useState<Foods | undefined>(undefined);
	const [modalOpen, setModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	useEffect(() => {
		const fetchFoods = async () => {
			const response = await api.get<Foods[]>('/foods');
			setFoods(response.data);
		};
		fetchFoods();
	}, []);

	const handleAddFood = async (food: Foods) => {
		try {
			const response = await api.post('/foods', {
				...food,
				available: true,
			});
			setFoods([...foods, response.data]);
		} catch (err) {
			console.log(err);
		}
	};

	const handleUpdateFood = async (food: Foods) => {
		try {
			const foodUpdated = await api.put<Foods | undefined>(
				`/foods/${editingFood?.id}`,
				{
					...editingFood,
					...food,
				}
			);
			const foodsUpdated = foods.map((f) =>
				f.id !== foodUpdated.data?.id ? f : foodUpdated.data
			);
			setFoods(foodsUpdated);
		} catch (err) {
			console.log(err);
		}
	};

	const handleDeleteFood = async (id: number) => {
		await api.delete(`/foods/${id}`);
		const foodsFiltered = foods.filter((food) => food.id !== id);
		setFoods(foodsFiltered);
	};

	const toggleModal = () => {
		setModalOpen(!modalOpen);
	};

	const toggleEditModal = () => {
		setEditModalOpen(!editModalOpen);
	};

	const handleEditFood = (food: Foods) => {
		setEditingFood(food);
		setEditModalOpen(true);
	};

	return (
		<>
			<Header openModal={toggleModal} />
			<ModalAddFood
				isOpen={modalOpen}
				setIsOpen={toggleModal}
				handleAddFood={handleAddFood}
			/>
			<ModalEditFood
				isOpen={editModalOpen}
				setIsOpen={toggleEditModal}
				editingFood={editingFood}
				handleUpdateFood={handleUpdateFood}
			/>

			<FoodsContainer data-testid="foods-list">
				{foods &&
					foods.map((food) => (
						<FoodComponent
							key={food.id}
							food={food}
							available={true}
							handleDelete={handleDeleteFood}
							handleEditFood={handleEditFood}
						/>
					))}
			</FoodsContainer>
		</>
	);
}
