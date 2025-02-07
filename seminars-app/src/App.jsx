import { useState, useEffect } from 'react'
import './App.css'
import { useToast,
   useDisclosure,
   Box,
   Heading,
   Spinner,
   Alert,
   AlertIcon,
   Text,
   Image,
   SimpleGrid,
   Card,
   CardBody,
   CardFooter,
   HStack,
   Badge,
   Button,
   Modal,
   ModalOverlay,
   ModalContent,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Input,
   Textarea,
   IconButton
  } from "@chakra-ui/react";
  import { RiDeleteBin6Line } from "react-icons/ri";

const API_URL = "http://localhost:3000/seminars"; //URL для API семинаров

function App() { //состояния для хранения списка семинаров, состояния загрузки, ошибок и текущего семинара
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeminar, setSelectedSeminar] = useState(null);

  const toast = useToast(); //Отображение всплывающих увдомлений
  const { isOpen, onOpen, onClose } = useDisclosure(); //Уведомаление модальным окном

  // Получение списка семинаров
  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await fetch(API_URL);
      if(!response.ok) throw new Error("Не удалось загрузить данные");
      const data = await response.json();
      setSeminars(data);
    } catch(error) {
      setError(error.message);
    }finally {
      setLoading(false);
    }
  };

  //Удаление семинара
  const deleteSeminar = async (id) => {
    if(!window.confirm("Вы уверены, что это семинар больше не актуален?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении");

      setSeminars(seminars.filter((s) => s.id !== id));
      toast({ title: "Семинар удален", status: "success", duration: 2000 });
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Открытие модального окна для редактирования
  const openEditModal = (seminar) => {
    setSelectedSeminar(seminar);
    onOpen();
  };

  // Отправка формы для редактирования семинара
  const handleEditSubmit = async (e) =>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedSeminar = {
      id: selectedSeminar.id,
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      time: formData.get("time"),
      photo: formData.get("photo"),
    };

    try {
      const response = await fetch(`${API_URL}/${selectedSeminar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSeminar),
      });

      if (!response.ok) throw new Error("Ошибка при обновлении");

      setSeminars(seminars.map((s) => (s.id === updatedSeminar.id ? updatedSeminar : s)));
      toast({ title: "Семинар обновлен", status: "success", duration: 2000 });
      onClose();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <Box maxW="6xl" mx="auto" p={4}>
      <Heading mb={6} >Список семинаров</Heading>

      {loading && <Spinner size="xl" display="block" mx="auto" />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {seminars.map((seminar) => (
            <Card key={seminar.id} boxShadow="md" borderRadius="lg" overflow="hidden">
              <Image
                objectFit="cover"
                width="100%"
                height="180px"
                src={seminar.photo}
                alt="Seminar Photo"
              />
              <CardBody>
                <Heading size="md" mb={2}>
                  {seminar.title}
                </Heading>
                <Text noOfLines={3} fontSize="sm" color="gray.600">
                  {seminar.description}
                </Text>
                <HStack justify="flex-start" justifyContent="flex-start" mt={4}>
                  <Badge colorScheme="blue">{seminar.date}</Badge>
                  <Badge colorScheme="green">{seminar.time}</Badge>
                </HStack>
              </CardBody>
              <CardFooter justify="space-between">
                <Button size="sm"  colorScheme="blue" variant="outline" _hover={{ bg: "blue.100" }}  _active={{ bg: "blue.700" }} onClick={() => openEditModal(seminar)}>
                  Редактировать
                </Button>
                <IconButton aria-label="Search database" size="sm" colorScheme="gray" variant="outline" _hover={{ bg: "gray.100" }} _active={{ bg: "gray.700" }} onClick={() => deleteSeminar(seminar.id)}>
                  <RiDeleteBin6Line />
                </IconButton>
              </CardFooter>
            </Card>
          ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Редактирование семинара</ModalHeader>
          <ModalBody>
            {selectedSeminar && (
              <form id="edit-form" onSubmit={handleEditSubmit}>
                <Input name="title" defaultValue={selectedSeminar.title} required mb={3} />
                <Textarea name="description" defaultValue={selectedSeminar.description} required mb={3}/>
                <Input name="date" defaultValue={selectedSeminar.date} required mb={3}/>
                <Input name="time" defaultValue={selectedSeminar.time} required mb={3}/>
                <Input name="photo" defaultValue={selectedSeminar.photo} required />
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="submit" form="edit-form" colorScheme="blue">
              Сохранить
            </Button>
            <Button onClick={onClose} ml={2}>Отмена</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default App;
