import axios from 'axios';
import { API_URL } from '../../config/env';
import { supabase } from '../../lib/supabase/client';
import { TutoringReview, TutoringSession } from '../types/Tutoring';
import { TutoringImageService } from './TutoringImageService';

/**
 * Función para convertir nombres de campos de camelCase (backend) a snake_case (Supabase)
 */
const toSnakeCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => toSnakeCase(item));
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir camelCase a snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Casos especiales
      const finalKey =
        key === 'tutorId' ? 'tutor_id' :
          key === 'courseId' ? 'course_id' :
            key === 'whatTheyWillLearn' ? 'what_they_will_learn' :
              key === 'imageUrl' ? 'image_url' :
                key === 'dayOfWeek' ? 'day_of_week' :
                  key === 'startTime' ? 'start_time' :
                    key === 'endTime' ? 'end_time' :
                      key === 'studentId' ? 'student_id' :
                        key === 'tutoringId' ? 'tutoring_id' :
                          snakeKey;

      result[finalKey] = toSnakeCase(data[key]);
    }
  }
  return result;
};

/**
 * Función para convertir nombres de campos de snake_case (Supabase) a camelCase (frontend)
 */
const toCamelCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir snake_case a camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());

      // Casos especiales
      const finalKey =
        key === 'tutor_id' ? 'tutorId' :
          key === 'course_id' ? 'courseId' :
            key === 'what_they_will_learn' ? 'whatTheyWillLearn' :
              key === 'image_url' ? 'imageUrl' :
                key === 'day_of_week' ? 'dayOfWeek' :
                  key === 'start_time' ? 'startTime' :
                    key === 'end_time' ? 'endTime' :
                      key === 'student_id' ? 'studentId' :
                        key === 'tutoring_id' ? 'tutoringId' :
                          camelKey;

      result[finalKey] = toCamelCase(data[key]);
    }
  }
  return result;
};

/**
 * Función auxiliar para manejar errores de Supabase
 */
const handleSupabaseError = (error: any, defaultMessage: string): never => {
  console.error('Error de Supabase:', error);
  throw new Error(error?.message || defaultMessage);
};

export const TutoringService = {
  // Obtener una tutoría por ID
  getTutoringSession: async (id: string): Promise<TutoringSession> => {
    try {
      try {
        const response = await axios.get(`${API_URL}/tutoring-sessions/${id}`);
        const tutoringData = toCamelCase(response.data);

        try {
          const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${id}/available-times`);
          const availableTimes = toCamelCase(timesResponse.data);
          tutoringData.availableTimes = availableTimes;
        } catch (timesError) {
          console.warn('Error al obtener horarios a través de API:', timesError);

          try {
            const { data: timesData, error: timesError } = await supabase
              .from('available_times')
              .select('*')
              .eq('tutoring_id', id);

            if (timesError) throw timesError;

            tutoringData.availableTimes = toCamelCase(timesData || []);
          } catch (supabaseTimesError) {
            console.warn('También falló la obtención de horarios desde Supabase:', supabaseTimesError);
            tutoringData.availableTimes = [];
          }
        }

        return new TutoringSession(tutoringData);
      } catch (apiError) {
        console.warn('Error al obtener tutoría a través de API, intentando con Supabase:', apiError);

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error(`No se encontró tutoría con ID: ${id}`);
        }

        const { data: timesData, error: timesError } = await supabase
          .from('available_times')
          .select('*')
          .eq('tutoring_id', id);

        if (timesError) {
          console.warn('Error al obtener horarios desde Supabase:', timesError);
        }

        const tutoringData = toCamelCase(data);
        tutoringData.availableTimes = toCamelCase(timesData || []);

        return new TutoringSession(tutoringData);
      }
    } catch (error) {
      console.error('Error al obtener tutoría:', error);
      throw error;
    }
  },

  getAllTutoringSessions: async (): Promise<TutoringSession[]> => {
    try {
      try {
        const response = await axios.get(`${API_URL}/tutoring-sessions`);
        const tutoringsData = toCamelCase(response.data);

        const tutoringsWithTimes = await Promise.all(
          tutoringsData.map(async (session: any) => {
            try {
              const timesResponse = await axios.get(
                `${API_URL}/tutoring-sessions/${session.id}/available-times`
              );
              const availableTimes = toCamelCase(timesResponse.data);

              return {
                ...session,
                availableTimes: availableTimes
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
      } catch (apiError) {
        console.warn('Error al obtener tutorías a través de API, intentando con Supabase:', apiError);

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .select('*');

        if (error) throw error;

        const sessions = toCamelCase(data || []);

        const sessionsWithTimes = await Promise.all(
          sessions.map(async (session: any) => {
            try {
              const { data: timesData } = await supabase
                .from('available_times')
                .select('*')
                .eq('tutoring_id', session.id);

              return {
                ...session,
                availableTimes: toCamelCase(timesData || [])
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id} desde Supabase:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return sessionsWithTimes.map((session: any) => new TutoringSession(session));
      }
    } catch (error) {
      console.error('Error al obtener tutorías:', error);
      throw error;
    }
  },

  getTutoringSessionsByTutorId: async (tutorId: string): Promise<TutoringSession[]> => {
    try {
      try {
        const response = await axios.get(`${API_URL}/tutoring-sessions`, {
          params: { tutorId }
        });
        const tutoringsData = toCamelCase(response.data);

        const tutoringsWithTimes = await Promise.all(
          tutoringsData.map(async (session: any) => {
            try {
              const timesResponse = await axios.get(
                `${API_URL}/tutoring-sessions/${session.id}/available-times`
              );
              const availableTimes = toCamelCase(timesResponse.data);

              return {
                ...session,
                availableTimes: availableTimes
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
      } catch (apiError) {
        console.warn('Error al obtener tutorías por tutor a través de API, intentando con Supabase:', apiError);

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .select('*')
          .eq('tutor_id', tutorId);

        if (error) throw error;

        const sessions = toCamelCase(data || []);

        const sessionsWithTimes = await Promise.all(
          sessions.map(async (session: any) => {
            try {
              const { data: timesData } = await supabase
                .from('available_times')
                .select('*')
                .eq('tutoring_id', session.id);

              return {
                ...session,
                availableTimes: toCamelCase(timesData || [])
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id} desde Supabase:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return sessionsWithTimes.map((session: any) => new TutoringSession(session));
      }
    } catch (error) {
      console.error('Error al obtener tutorías por tutor:', error);
      throw error;
    }
  },

  getTutoringSessionsByCourseId: async (courseId: string): Promise<TutoringSession[]> => {
    try {
      try {
        const response = await axios.get(`${API_URL}/tutoring-sessions`, {
          params: { courseId }
        });
        const tutoringsData = toCamelCase(response.data);

        const tutoringsWithTimes = await Promise.all(
          tutoringsData.map(async (session: any) => {
            try {
              const timesResponse = await axios.get(
                `${API_URL}/tutoring-sessions/${session.id}/available-times`
              );
              const availableTimes = toCamelCase(timesResponse.data);

              return {
                ...session,
                availableTimes: availableTimes
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
      } catch (apiError) {
        console.warn('Error al obtener tutorías por curso a través de API, intentando con Supabase:', apiError);

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .select('*')
          .eq('course_id', courseId);

        if (error) throw error;

        const sessions = toCamelCase(data || []);

        const sessionsWithTimes = await Promise.all(
          sessions.map(async (session: any) => {
            try {
              const { data: timesData } = await supabase
                .from('available_times')
                .select('*')
                .eq('tutoring_id', session.id);

              return {
                ...session,
                availableTimes: toCamelCase(timesData || [])
              };
            } catch (error) {
              console.warn(`Error al obtener horarios para tutoría ${session.id} desde Supabase:`, error);
              return {
                ...session,
                availableTimes: []
              };
            }
          })
        );

        return sessionsWithTimes.map((session: any) => new TutoringSession(session));
      }
    } catch (error) {
      console.error('Error al obtener tutorías por curso:', error);
      throw error;
    }
  },

  getReviews: async (tutoringId: string): Promise<TutoringReview[]> => {
    try {
      try {
        const response = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/reviews`);

        if (!response.data || !Array.isArray(response.data)) {
          console.warn('No se recibieron reseñas o el formato es incorrecto');
          return [];
        }

        const reviewsData = toCamelCase(response.data);

        const reviewsWithStudents = await Promise.all(
          reviewsData.map(async (review: any) => {
            try {
              const studentId = review.studentId;

              if (!studentId) {
                console.warn('Reseña sin ID de estudiante:', review);
                return review;
              }

              const studentResponse = await axios.get(`${API_URL}/profiles/${studentId}`);
              const studentData = toCamelCase(studentResponse.data);

              return {
                ...review,
                student: studentData
              };
            } catch (error) {
              console.warn(`Error al obtener datos del estudiante:`, error);
              return review;
            }
          })
        );

        return reviewsWithStudents.map((review: any) => new TutoringReview(review));
      } catch (apiError) {
        console.warn('Error al obtener reseñas a través de API, intentando con Supabase:', apiError);

        const { data, error } = await supabase
          .from('tutoring_reviews')
          .select('*')
          .eq('tutoring_id', tutoringId);

        if (error) throw error;

        const reviews = toCamelCase(data || []);

        const reviewsWithStudents = await Promise.all(
          reviews.map(async (review: any) => {
            try {
              if (!review.studentId) {
                return review;
              }

              const { data: studentData, error: studentError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', review.studentId)
                .single();

              if (studentError) {
                console.warn(`Error al obtener datos del estudiante desde Supabase:`, studentError);
                return review;
              }

              return {
                ...review,
                student: toCamelCase(studentData)
              };
            } catch (error) {
              console.warn(`Error general al obtener datos del estudiante:`, error);
              return review;
            }
          })
        );

        return reviewsWithStudents.map((review: any) => new TutoringReview(review));
      }
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      return [];
    }
  },

  createTutoring: async (tutoring: any): Promise<TutoringSession> => {
    try {
      const tutoringPayload = {
        tutorId: tutoring.tutorId,
        courseId: tutoring.courseId,
        title: tutoring.title || tutoring.courseName,
        description: tutoring.description,
        price: Number(tutoring.price),
        whatTheyWillLearn: Array.isArray(tutoring.whatTheyWillLearn) ? 
          tutoring.whatTheyWillLearn : 
          tutoring.whatTheyWillLearn.split('\n').map((item: string) => item.trim()).filter(Boolean),
        imageUrl: tutoring.imageUrl || "",
        availableTimes: tutoring.availableTimes.map((slot: any) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      };

      try {
        const response = await axios.post(`${API_URL}/tutoring-sessions`, tutoringPayload);
        const createdTutoring = response.data;
        return new TutoringSession(createdTutoring);
      } catch (apiError) {
        console.warn('Error al crear tutoría a través de API, intentando con Supabase:', apiError);

        const tutoringSnakeCase = toSnakeCase({
          tutor_id: tutoring.tutorId,
          course_id: tutoring.courseId,
          title: tutoring.title || tutoring.courseName,
          description: tutoring.description,
          price: Number(tutoring.price),
          what_they_will_learn: Array.isArray(tutoring.whatTheyWillLearn) ? 
            tutoring.whatTheyWillLearn : 
            tutoring.whatTheyWillLearn.split('\n').map((item: string) => item.trim()).filter(Boolean),
          image_url: tutoring.imageUrl || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .insert(tutoringSnakeCase)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('No se recibieron datos después de crear la tutoría');
        }

        const createdTutoringId = data.id;

        if (tutoring.availableTimes && tutoring.availableTimes.length > 0) {
          const timesData = tutoring.availableTimes.map((time: any) => ({
            tutoring_id: createdTutoringId,
            day_of_week: time.dayOfWeek,
            start_time: time.startTime,
            end_time: time.endTime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: timesError } = await supabase
            .from('available_times')
            .insert(timesData);

          if (timesError) {
            console.error('Error al crear horarios disponibles:', timesError);
          }
        }

        const { data: fullTutoring, error: getTutoringError } = await supabase
          .from('tutoring_sessions')
          .select('*')
          .eq('id', createdTutoringId)
          .single();

        if (getTutoringError) throw getTutoringError;

        const { data: availableTimes, error: getTimesError } = await supabase
          .from('available_times')
          .select('*')
          .eq('tutoring_id', createdTutoringId);

        if (getTimesError) {
          console.warn('Error al obtener horarios:', getTimesError);
        }

        const tutoringData = toCamelCase(fullTutoring);
        tutoringData.availableTimes = toCamelCase(availableTimes || []);

        return new TutoringSession(tutoringData);
      }
    } catch (error) {
      console.error('Error al crear tutoría:', error);

      if (axios.isAxiosError(error) && error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  },

  updateTutoring: async (tutoringId: string, updates: any): Promise<TutoringSession> => {
    try {
      const updateData = {
        ...(updates.image_url !== undefined && { imageUrl: updates.image_url }),
        ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
        ...(updates.what_they_will_learn !== undefined && { whatTheyWillLearn: updates.what_they_will_learn }),
        ...(updates.whatTheyWillLearn !== undefined && { whatTheyWillLearn: updates.whatTheyWillLearn }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.price !== undefined && { price: Number(updates.price) }),
        ...(updates.title !== undefined && { title: updates.title }),
      };

      try {
        const response = await axios.patch(
          `${API_URL}/tutoring-sessions/${tutoringId}`,
          updateData
        );

        const updatedTutoring = toCamelCase(response.data);

        return new TutoringSession(updatedTutoring);
      } catch (apiError) {
        console.warn('Error al actualizar tutoría a través de API, intentando con Supabase:', apiError);

        const updateDataSnakeCase = toSnakeCase({
          ...updateData,
          updated_at: new Date().toISOString()
        });

        const { data, error } = await supabase
          .from('tutoring_sessions')
          .update(updateDataSnakeCase)
          .eq('id', tutoringId)
          .single();

        if (error) throw error;

        return await TutoringService.getTutoringSession(tutoringId);
      }
    } catch (error) {
      console.error('Error al actualizar tutoría:', error);
      throw error;
    }
  },

  deleteTutoring: async (tutoringId: string): Promise<boolean> => {
    try {
      try {
        const tutoringResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}`);
        const tutoringData = tutoringResponse.data;

        try {
          const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/available-times`);
          const times = timesResponse.data;

          if (times && times.length > 0) {
            await Promise.all(
              times.map((time: any) => 
                axios.delete(`${API_URL}/tutoring-sessions/available-times/${time.id}`)
              )
            );
          }
        } catch (timesError) {
          console.warn('Error al eliminar horarios disponibles:', timesError);
        }

        try {
          const reviewsResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/reviews`);
          const reviews = reviewsResponse.data;

          if (reviews && reviews.length > 0) {
            await Promise.all(
              reviews.map((review: any) => 
                axios.delete(`${API_URL}/tutoring-sessions/reviews/${review.id}`)
              )
            );
          }
        } catch (reviewsError) {
          console.warn('Error al eliminar reseñas:', reviewsError);
        }

        try {
          const materialsResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/materials`);
          const materials = materialsResponse.data;

          if (materials && materials.length > 0) {
            await Promise.all(
              materials.map((material: any) => 
                axios.delete(`${API_URL}/tutoring-sessions/materials/${material.id}`)
              )
            );
          }
        } catch (materialsError) {
          console.warn('Error al eliminar materiales:', materialsError);
        }

        try {
          if (tutoringData.imageUrl) {
            const imageUrlParts = tutoringData.imageUrl.split('/');
            const fileName = imageUrlParts[imageUrlParts.length - 1];
            const userId = tutoringData.tutorId;

            await TutoringImageService.deleteTutoringImage(userId, fileName);
          }
        } catch (imageError) {
          console.warn('Error al eliminar imagen:', imageError);
        }
      } catch (relatedError) {
        console.warn('Error al eliminar elementos relacionados:', relatedError);
      }

      await axios.delete(`${API_URL}/tutoring-sessions/${tutoringId}`);

      return true;
    } catch (error) {
      console.error('Error al eliminar tutoría:', error);
      throw error;
    }
  }
};