import { WhereFilterOp } from "firebase-admin/firestore";
import { db } from "./config";
import { firebaseCollectionPrefix } from "@/utils/constants";

// eslint-disable-next-line
export type CollectionQuery = [any, WhereFilterOp, any];

interface addDocumentInterface {
  data: object;
  collectionName: string;
  id?: string;
  prefix?: string;
}

interface getDocumentByIdInterface {
  collectionName: string;
  id: string;
  prefix?: string;
}

interface removeDocumentInterface {
  collectionName: string;
  id: string;
  prefix?: string;
}

interface getDocumentInterface {
  collectionName: string;
  // eslint-disable-next-line
  queries?: [any, WhereFilterOp, any][];
  limit?: number;
  prefix?: string;
}

interface updateDocumentByIdInterface {
  id: string;
  // eslint-disable-next-line
  updates: any;
  collectionName: string;
  prefix?: string;
}

export const addDocument = async ({
  data,
  collectionName,
  id,
  prefix,
}: addDocumentInterface) => {
  collectionName += `_${prefix}` || firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null =
    null;

  if (id) {
    docRef = collectionRef.doc(id);
    await docRef.set(data);
  } else {
    docRef = await collectionRef.add(data);
  }

  return docRef;
};

export const removeDocumentById = async ({
  collectionName,
  id,
  prefix,
}: removeDocumentInterface) => {
  try {
    const collectionRef = db.collection(collectionName);
    const docRef = collectionRef.doc(id);

    // Delete the document
    await docRef.delete();

    return true;
  } catch (e) {
    const error = e as Error;
    // eslint-disable-next-line no-console
    console.error("Error removing document:", error.message);
    return false;
  }
};

export const removeDocument = async ({
  queries,
  collectionName,
  limit: _limit,
  prefix,
}: getDocumentInterface) => {
  collectionName += `_${prefix}` || firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    collectionRef;

  if (queries && queries.length > 0) {
    for (const query of queries) {
      const [field, op, value] = query;
      queryRef = queryRef.where(field, op, value);
    }
  }

  if (_limit) {
    queryRef = queryRef.limit(_limit);
  }

  const querySnapshot = await queryRef.get();

  querySnapshot.forEach((doc) => {
    const docRef = collectionRef.doc(doc.id);
    docRef.delete();
  });

  return true;
};

export const getDocumentById = async ({
  collectionName,
  id,
  prefix,
}: getDocumentByIdInterface) => {
  collectionName += `_${prefix}` || firebaseCollectionPrefix;
  const docRef = db.collection(collectionName).doc(id);
  const docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    const data = docSnapshot.data();
    return data;
  } else {
    return null;
  }
};

export const getDocument = async ({
  queries,
  collectionName,
  limit: _limit,
  prefix,
}: getDocumentInterface) => {
  collectionName += `_${prefix}` || firebaseCollectionPrefix;
  const collectionRef = db.collection(collectionName);
  let queryRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    collectionRef;

  if (queries && queries.length > 0) {
    for (const query of queries) {
      const [field, op, value] = query;
      queryRef = queryRef.where(field, op, value);
    }
  }

  if (_limit) {
    queryRef = queryRef.limit(_limit);
  }

  const querySnapshot = await queryRef.get();

  // eslint-disable-next-line
  const data: any[] = [];

  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
};

export const updateDocumentById = async ({
  id,
  updates,
  collectionName,
  prefix,
}: updateDocumentByIdInterface) => {
  collectionName += `_${prefix}` || firebaseCollectionPrefix;
  const dataRef = db.collection(collectionName).doc(id);
  await dataRef.update(updates);
  const docSnap = await dataRef.get();

  return { ...docSnap.data(), id: docSnap.id };
};
