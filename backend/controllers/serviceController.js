import Service from '../models/Service.js';

export const getServices = async (req, res, next) => {
  try {
    const query = { isActive: true };

    // Optional filter: ?featured=true
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    const services = await Service.find(query).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      data: services,
    });
  } catch (error) {
    next(error);
  }
};
