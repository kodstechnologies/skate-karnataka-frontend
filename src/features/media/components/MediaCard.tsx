import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Chip,
  Box,
  alpha,
  Tooltip,
} from "@mui/material";
import { Pencil, Calendar, MapPin, Heart, Share2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type MediaCardProps = {
  id: number;
  image: string;
  name: string;
  type: string;
  date: string;
  location: string;
};

function MediaCard({
  id,
  image,
  name,
  type,
  date,
  location,
}: MediaCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const getTypeColor = () => {
    switch (type?.toLowerCase()) {
      case 'state': return '#1976d2';
      case 'district': return '#388e3c';
      case 'club': return '#f57c00';
      default: return '#616161';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full Screen Image */}
      <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
        <CardMedia
          component="img"
          image={image || '/default.jpg'}
          alt={name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, 
              rgba(0,0,0,0.8) 0%,
              rgba(0,0,0,0.4) 50%,
              rgba(0,0,0,0.2) 100%)`,
            opacity: isHovered ? 0.7 : 0.5,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Content Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'transform 0.3s ease',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 800,
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            }}
          >
            {name}
          </Typography>

          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Calendar size={14} color="white" />
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                {formatDate(date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <MapPin size={14} color="white" />
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                {location}
              </Typography>
            </Stack>
          </Stack>

          {/* Action Buttons */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.3s ease 0.1s',
            }}
          >
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/media/edit/${id}`)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', transform: 'scale(1.1)' },
                }}
              >
                <Pencil size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title={liked ? "Unlike" : "Like"}>
              <IconButton
                size="small"
                onClick={() => setLiked(!liked)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: liked ? '#ff4444' : 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <Heart size={18} fill={liked ? '#ff4444' : 'none'} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share">
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <Share2 size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Details">
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <ExternalLink size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Type Badge */}
        <Chip
          label={type}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: alpha(getTypeColor(), 0.9),
            color: 'white',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </Box>

      {/* Minimal Card Content */}
      <CardContent sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 3,
                height: 20,
                bgcolor: getTypeColor(),
                borderRadius: 2,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {type} • {location}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatDate(date)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MediaCard;