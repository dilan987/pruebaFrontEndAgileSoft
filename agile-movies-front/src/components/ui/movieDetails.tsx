import React, { useState, useEffect } from 'react';
import { Flex, Box, Heading, Text, Avatar, Image } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RefreshToken } from '../utils/refresh';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface Actor {
  id: number;
  name: string;
  image: string;
}

const MovieDetails = () => {
  const [user, setUser] = useState<User | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  useEffect(() => {
    const fetchActors = async (retry = false) => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        setLoading(false);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const movieDataString = searchParams.get('movieData');
      const movieId = movieDataString ? JSON.parse(decodeURIComponent(movieDataString)) : null;
      if (!movieId) {
        setError('No se encontró el ID de la película.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://161.35.140.236:9005/api/movies/${movieId.id}/actors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { imageBaseUrl, data } = response.data;
        const actorsData = data.map((actor: any) => ({
          id: actor.id,
          name: actor.name,
          image: `${imageBaseUrl}${actor.profile_path}`,
        }));
        setActors(actorsData);
      } catch (err: any) {
        if (err.response && err.response.status === 401 && !retry) {
          try {
            await RefreshToken();
            fetchActors(true);
          } catch (refreshError) {
            navigate('/login');
          }
        } else {
          setError('Error al obtener los datos de los actores.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, [navigate]);

  const searchParams = new URLSearchParams(window.location.search);
  const movieDataString = searchParams.get('movieData');
  const movieData = movieDataString ? JSON.parse(decodeURIComponent(movieDataString)) : null;

  if (!movieData) {
    return (
      <Flex justify="center" align="center" minHeight="100vh">
        <Text>Error: No se encontraron datos de la película.</Text>
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="100vh">
        <Text>Cargando...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" minHeight="100vh">
        <Text>{error}</Text>
      </Flex>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <Flex direction="column" align="center" justify="center" minHeight="100vh">
      {/* Encabezado */}
      <Flex justify="space-between" width="100%" p={5} bg="black" color="white">
        <Heading>AgileMovies</Heading>
        <Flex align="center">
          {user ? (
            <>
              <Text mr={2}>{`${user.firstName} ${user.lastName}`}</Text>
              <Avatar name={`${user.firstName} ${user.lastName}`} />
            </>
          ) : (
            <>
              <Text mr={2}>Nombre Apellido</Text>
              <Avatar name="Nombre Apellido" />
            </>
          )}
        </Flex>
      </Flex>

      {/* Cuerpo */}
      <Box mx={5} maxWidth="1000px" width="100%" p={4} mt={10}>
        <Flex direction="column" align="center" bg="gray.800" p={5} borderRadius="md" boxShadow="lg">
          {/* Título de la película */}
          <Heading mb={4} textAlign="center" color="white">{movieData.title}</Heading>

          {/* Contenedor para la imagen grande */}
          <Box mb={4} width="100%" maxW="500px" height="300px" overflow="hidden">
            <Image src={movieData.posterImage} alt={movieData.title} borderRadius="md" boxShadow="lg" width="100%" height="100%" objectFit="cover" />
          </Box>

          {/* Contenedor para la foto pequeña y la descripción */}
          <Flex direction={{ base: 'column', md: 'row' }} alignItems={{ base: 'center', md: 'flex-start' }} width="100%">
            {/* Pequeña foto de la película */}
            <Box mr={4} mb={{ base: 4, md: 0 }} flexShrink={0}>
              <Image src={movieData.image} alt={movieData.title} boxSize="120px" borderRadius="md" />
            </Box>

            {/* Descripción de la película */}
            <Box flex="1" color="white">
              <Text textAlign="justify">{movieData.overview}</Text>
            </Box>
          </Flex>
        </Flex>

        {/* Espacio adicional entre la descripción y el reparto */}
        <Box height="20px" />

        {/* Sección de reparto */}
        <Box width="100%" mt={10}>
          <Heading mb={6} color="black" textAlign="center">Reparto</Heading> {/* Ajuste de margen inferior */}
          <Slider {...settings}>
            {actors.map((actor: Actor) => (
              <Box key={actor.id} maxW="120px" textAlign="center">
                <Image src={actor.image} alt={actor.name} borderRadius="full" />
                <Text mt={2} color="white">{actor.name}</Text>
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    </Flex>
  );
};

export default MovieDetails;











  
  
  
  
  
  
  