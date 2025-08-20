import axios from 'axios';
import type { HealthRecord, DogInfo } from '../../pages/RecordHealt/interface/types';

const API_URL = 'http://localhost:8000'; // Adjust if your API base URL is different

export const searchDogs = async (query: string): Promise<DogInfo[]> => {
  try {
    const response = await axios.get(`${API_URL}/dogs/search`, {
      params: { name: query }, // Assuming your API searches by name
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching dogs:', error);
    throw error;
  }
};

export const getHealthRecordsByDogId = async (dogId: string): Promise<HealthRecord[]> => {
  try {
    const response = await axios.get(`${API_URL}/health-records/dog/${dogId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching health records for dog ${dogId}:`, error);
    throw error;
  }
};

export const createHealthRecord = async (record: HealthRecord): Promise<HealthRecord> => {
  try {
    const response = await axios.post(`${API_URL}/health-records`, record);
    return response.data.data;
  } catch (error) {
    console.error('Error creating health record:', error);
    throw error;
  }
};

export const updateHealthRecord = async (medId: number, record: HealthRecord): Promise<HealthRecord> => {
  try {
    const response = await axios.put(`${API_URL}/health-records/${medId}`, record);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating health record with ID ${medId}:`, error);
    throw error;
  }
};

export const deleteHealthRecord = async (medId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/health-records/${medId}`);
  } catch (error) {
    console.error(`Error deleting health record with ID ${medId}:`, error);
    throw error;
  }
};
