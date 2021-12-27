import {join} from 'path';
import {Low, JSONFile} from 'lowdb';
import _ from 'lodash';
import {ComplexProperty, IComplexProperty} from '../models/property/complex-property';

/**
 * Repository for complex properties.
 */
export class ComplexPropertyRepository {
	private adapter: JSONFile<IComplexProperty[]>;
	private db: Low<IComplexProperty[]>;
	private store: string = join('./store', 'properties', 'complex-properties.json');

	/**
     * Initiated with a connection to the property set database.
    */
	constructor() {
		this.adapter = new JSONFile<IComplexProperty[]>(this.store);
		this.db = new Low(this.adapter);
	}

	/**
     * list all ComplexProperties
	 * @return {Promise<ComplexProperty[]>} a list of ComplexProperties
	 */
	public async getAll(): Promise<ComplexProperty[]> {
		await this.db.read();
		return this.db.data.map((ComplexPropertyData) => {
			return ComplexProperty.fromData(ComplexPropertyData);
		});
	}

	/**
     * get one ComplexProperty (even though all is fetched)
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty>} a ComplexProperty
	 */
	public async get(complexProperty: ComplexProperty | IComplexProperty): Promise<ComplexProperty> {
		await this.db.read();
		const chain = _.chain(this.db.data);

		return ComplexProperty.fromData(chain.find({name: complexProperty.name}).value());
	}

	/**
     * store a ComplexProperty
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty>} a ComplexProperty
	 */
	public async add(complexProperty: ComplexProperty): Promise<ComplexProperty> {
		await this.db.read();
		// TODO: verify that the name is unique

		this.db.data.push(complexProperty);
		await this.db.write();

		return complexProperty;
	}

	/**
     * update (name and description of) a ComplexProperty
	 * @param  {ComplexProperty} oldComplexProperty
	 * @param  {ComplexProperty} newComplexProperty
	 * @return {Promise<ComplexProperty>} the updated ComplexProperty
	 */
	public async update(
		oldComplexProperty: ComplexProperty,
		newComplexProperty: ComplexProperty,
	): Promise<ComplexProperty> {
		await this.db.read();

		const index = this.db.data.findIndex((pSet) => pSet.name.value === oldComplexProperty.name.value);
		if (index === -1) throw new Error('ComplexProperty not found');

		this.db.data[index] = newComplexProperty;

		// TODO: rename all references in properties

		await this.db.write();

		return this.get(newComplexProperty);
	}

	/**
     * delete a ComplexProperty
	 * @param  {ComplexProperty} complexProperty
	 * @return {Promise<ComplexProperty[]>} the deleted ComplexProperties
	 */
	public async remove(complexProperty: ComplexProperty): Promise<ComplexProperty> {
		await this.db.read();

		const chain = _.chain(this.db.data);
		const removed = chain.remove({
			name: {
				value: complexProperty.name.value,
			},
		}).value();

		// TODO: be smarter when checking for success
		if (removed.length === 1) {
			// TODO: also remove referenced entities. probably need a helper to find what is referenced

			await this.db.write();

			return ComplexProperty.fromData(removed[0]);
		} else {
			console.error('nothing removed since multiple where found:', removed);
			return null;
		}
	}
}
