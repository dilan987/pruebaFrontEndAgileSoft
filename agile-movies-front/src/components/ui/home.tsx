import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flex,
  Box,
  Heading,
  Text,
  Avatar,
  Image,
  Badge,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { RefreshToken } from '../utils/refresh';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

// Tipo para los datos de una película
interface Movie {
  id: number;
  title: string;
  image: string;
}

// Tipo para la respuesta del endpoint de películas
interface MovieResponse {
  imageBaseUrl: string;
  data: {
    backdrop_path: string;
    id: number;
    title: string;
    poster_path: string;
    overview: string;
  }[];
}

// Tipo para el objeto de usuario
interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export default function HomePage() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [popularHasMore, setPopularHasMore] = useState(true);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [errorNowPlaying, setErrorNowPlaying] = useState<string | null>(null);
  const [errorPopular, setErrorPopular] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate(); // Hook para redirigir

  useEffect(() => {
    getNowPlayingMovies(page);
    getUserInfo();
  }, [page]);

  useEffect(() => {
    getPopularMovies(popularPage);
  }, [popularPage]);

  const getUserInfo = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const getNowPlayingMovies = async (pageNumber: number, retry = false): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorNowPlaying('No hay token de autorización disponible.');
      return;
    }

    const url = `http://161.35.140.236:9005/api/movies/now_playing?page=${pageNumber}`;

    setLoadingNowPlaying(true);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && !retry) {
          await RefreshToken();
          return getNowPlayingMovies(pageNumber, true); // Reintenta la petición
        } else {
          setErrorNowPlaying('Error al obtener películas en estreno.');
          return;
        }
      }

      const data: MovieResponse = await response.json();
      const newMovies = data.data.map(movie => ({
        id: movie.id,
        title: movie.title,
        image: `${data.imageBaseUrl}${movie.backdrop_path}`,
        posterImage: `${data.imageBaseUrl}${movie.poster_path}`,
        overview: movie.overview,
      }));

      setNowPlayingMovies(prevMovies => [...prevMovies, ...newMovies]);
      setHasMore(newMovies.length > 0);
    } catch (error) {
      if (!retry) {
        console.error('Error al obtener películas en estreno:', error);
        setErrorNowPlaying('Error al obtener películas en estreno.');
      } else {
        navigate('/login'); // Redirige al login si falla
      }
    } finally {
      setLoadingNowPlaying(false);
    }
  };

  const getPopularMovies = async (pageNumber: number, retry = false): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorPopular('No hay token de autorización disponible.');
      return;
    }

    const url = `http://161.35.140.236:9005/api/movies/popular?page=${pageNumber}`;

    setLoadingPopular(true);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && !retry) {
          await RefreshToken();
          return getPopularMovies(pageNumber, true); // Reintenta la petición
        } else {
          setErrorPopular('Error al obtener películas populares.');
          return;
        }
      }

      const data: MovieResponse = await response.json();
      const newPopularMovies = data.data.map(movie => ({
        id: movie.id,
        title: movie.title,
        image: `${data.imageBaseUrl}${movie.backdrop_path}`,
        posterImage: `${data.imageBaseUrl}${movie.poster_path}`,
        overview: movie.overview,
      }));

      setPopularMovies(prevMovies => [...prevMovies, ...newPopularMovies]);
      setPopularHasMore(newPopularMovies.length > 0);
    } catch (error) {
      if (!retry) {
        console.error('Error al obtener películas populares:', error);
        setErrorPopular('Error al obtener películas populares.');
      } else {
        navigate('/login'); // Redirige al login si falla
      }
    } finally {
      setLoadingPopular(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight && popularHasMore && !loadingPopular) {
      setPopularPage(prevPage => prevPage + 1);
    }
  };

  const ArrowLeft = ({ onClick }: { onClick?: () => void }) => (
    <IconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick}
      aria-label="Previous"
      position="absolute"
      left="0"
      top="50%"
      transform="translateY(-50%)"
      zIndex="2"
      bg="gray.700"
      _hover={{ bg: 'gray.600' }}
      borderRadius="full"
    />
  );

  const ArrowRight = ({ onClick }: { onClick?: () => void }) => (
    <IconButton
      icon={<ChevronRightIcon />}
      onClick={onClick}
      aria-label="Next"
      position="absolute"
      right="0"
      top="50%"
      transform="translateY(-50%)"
      zIndex="2"
      bg="gray.700"
      _hover={{ bg: 'gray.600' }}
      borderRadius="full"
    />
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "60px",
    nextArrow: <ArrowRight />,
    prevArrow: <ArrowLeft />,
    afterChange: (currentSlide: number) => {
      if (currentSlide === nowPlayingMovies.length - 1 && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          centerPadding: "40px"
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "20px"
        }
      }
    ]
  };

  return (
    <Flex direction="column" align="center" minHeight="100vh">
      {/* Encabezado */}
      <Flex justify="space-between" width="100%" p={5} bg="black" color="white" mb={0}>
        <Heading ml={8}>AgileMovies</Heading>
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

      {/* Sección de Estrenos */}
      <Box bg="gray.900" color="white" width="100%" overflow="hidden" position="relative" py={5}>
        <Heading textAlign="center" mb={4}>Películas en estreno</Heading>
        {loadingNowPlaying && <Spinner mt={4} />}
        {errorNowPlaying && <Text color="red.500">{errorNowPlaying}</Text>}
        {nowPlayingMovies.length > 0 && (
          <Slider {...settings}>
            {nowPlayingMovies.map(movie => (
              <Link key={movie.id} to={`/movie/${movie.id}?movieData=${encodeURIComponent(JSON.stringify(movie))}`}>
                <Box p={2}>
                  <Image src={movie.image} alt={movie.title} borderRadius="md" />
                  <Text mt={2} fontWeight="semibold" textAlign="center">{movie.title}</Text>
                </Box>
              </Link>
            ))}
          </Slider>
        )}
      </Box>

      {/* Espacio adicional entre secciones */}
      <Box height="50px" />

      {/* Sección de Películas Populares */}
      <Box
        color="black"
        mt={5}
        width="100%"
        overflow="hidden"
        position="relative"
        onScroll={handleScroll}
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        <Heading textAlign="center" mb={4}>
          Películas más populares
        </Heading>
        <Flex flexWrap="wrap" justifyContent="center">
          {popularMovies.map(popularMovie => (
            <Link
              key={popularMovie.id}
              to={`/movie/${popularMovie.id}?movieData=${encodeURIComponent(JSON.stringify(popularMovie))}`}
            >
              <MovieCard movie={popularMovie} />
            </Link>
          ))}
        </Flex>
        {loadingPopular && <Spinner mt={4} />}
        {errorPopular && <Text color="red.500">{errorPopular}</Text>}
      </Box>
    </Flex>
  );
}

// Componente de Tarjeta de Película
const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <Box maxW="200px" borderWidth="1px" borderRadius="lg" overflow="hidden" m={2}>
      <Image src={movie.image} alt={movie.title} />
      <Box p="2">
        <Box display="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            New
          </Badge>
        </Box>
        <Box mt="2" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
          {movie.title}
        </Box>
      </Box>
    </Box>
  );
};








             
