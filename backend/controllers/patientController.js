const prisma = require('../prismaClient');

const getPatients = async (req, res) => {
  try {
    // Ideally we would extract caregiverId from the JWT token.
    // For now, let's just return all patients or a mocked list if DB is empty.
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' }
    });
    
    // Return empty array if no patients exist, instead of hardcoded 3
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching patients' });
  }
};

module.exports = {
  getPatients
};
