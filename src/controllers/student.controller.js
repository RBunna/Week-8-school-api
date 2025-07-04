import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: include
 *         schema: 
 *           type: string
 *           enum: [ course ]
 *         description: Join other table
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: orderBy
 *         schema: 
 *           type: string
 *           enum: [ id, name, email, createdAt, updatedAt ]
 *           default: id
 *         description: Order by
 *       - in: query
 *         name: order
 *         schema: 
 *           type: string
 *           enum: [ asc, desc ]
 *           default: asc
 *         description: >
 *           Sorting order:
 *            * `asc` - Ascending
 *            * `desc` - Descending
 *     responses:
 *       200:
 *         description: List of students
 */
export const getAllStudents = async (req, res) => {

    var include = [];
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const orderBy = [ 
        [req.query.orderBy || 'id', 
        req.query.order || 'asc' ]
    ];

    const total = await db.Student.count();

    switch (req.query.include) {
        case 'course':
            include = [db.Course];
            break;
        default:
            include = null
    }

    try {
        const students = await db.Student.findAll({ 
            include: include, 
            limit: limit,
            offset: (page - 1) * limit,
            order: orderBy
        });
        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit)
            },
            data: students
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: A student
 *       404:
 *         description: Not found
 */
export const getStudentById = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id, { include: db.Course });
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
