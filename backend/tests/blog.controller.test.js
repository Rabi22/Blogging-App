import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { addComment, deleteBlogById } from '../src/controllers/blog.controller.js';
import Blog from '../src/models/blog.model.js';
import Comment from '../src/models/comment.model.js';

test('addComment returns 404 and does not create a comment when no published blog exists', async () => {
  const originalFindOne = Blog.findOne;
  const originalCreate = Comment.create;
  const createdComments = [];

  Blog.findOne = async () => null;
  Comment.create = async (payload) => {
    createdComments.push(payload);
    return payload;
  };

  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  try {
    await addComment({ body: { blog: 'blog-1', name: 'Alice', content: 'Hello' } }, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(createdComments, []);
  } finally {
    Blog.findOne = originalFindOne;
    Comment.create = originalCreate;
  }
});

test('deleteBlogById aborts the transaction and preserves blog and comments when a later delete fails', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindByIdAndDelete = Blog.findByIdAndDelete;
  const originalDeleteMany = Comment.deleteMany;

  const initialBlogStore = [{ _id: 'blog-1', title: 'Test blog' }];
  const initialCommentStore = [{ blog: 'blog-1', content: 'Hello there' }];
  let blogStore = [...initialBlogStore];
  let commentStore = [...initialCommentStore];
  let deletedBlog = null;
  let seenBlogSession = null;
  let seenCommentSession = null;

  const fakeSession = {
    started: false,
    committed: false,
    aborted: false,
    inTransaction() {
      return this.started;
    },
    async startTransaction() {
      this.started = true;
    },
    async commitTransaction() {
      this.committed = true;
      this.started = false;
    },
    async abortTransaction() {
      this.aborted = true;
      this.started = false;
      blogStore = deletedBlog ? [...blogStore, deletedBlog] : blogStore;
      commentStore = [...initialCommentStore];
    },
    async endSession() {}
  };

  mongoose.startSession = async () => fakeSession;

  Blog.findByIdAndDelete = async (id, options = {}) => {
    seenBlogSession = options.session;
    const index = blogStore.findIndex((blog) => blog._id === id);
    if (index === -1) {
      return null;
    }
    const [removedBlog] = blogStore.splice(index, 1);
    deletedBlog = removedBlog;
    return removedBlog;
  };

  Comment.deleteMany = async (_filter, options = {}) => {
    seenCommentSession = options.session;
    throw new Error('simulated deleteMany failure');
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  try {
    await deleteBlogById({ params: { id: 'blog-1' } }, res);

    assert.equal(fakeSession.aborted, true);
    assert.equal(fakeSession.committed, false);
    assert.equal(seenBlogSession, fakeSession);
    assert.equal(seenCommentSession, fakeSession);
    assert.deepEqual(blogStore, initialBlogStore);
    assert.deepEqual(commentStore, initialCommentStore);
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.payload, { message: 'Failed to delete blog' });
  } finally {
    mongoose.startSession = originalStartSession;
    Blog.findByIdAndDelete = originalFindByIdAndDelete;
    Comment.deleteMany = originalDeleteMany;
  }
});

test('deleteBlogById uses the blogId route parameter when deleting a blog', async () => {
  const originalStartSession = mongoose.startSession;
  const originalFindByIdAndDelete = Blog.findByIdAndDelete;
  const originalDeleteMany = Comment.deleteMany;

  let deletedBlogId = null;
  let deletedCommentBlogId = null;

  const fakeSession = {
    started: false,
    committed: false,
    aborted: false,
    inTransaction() {
      return this.started;
    },
    async startTransaction() {
      this.started = true;
    },
    async commitTransaction() {
      this.committed = true;
      this.started = false;
    },
    async abortTransaction() {
      this.aborted = true;
      this.started = false;
    },
    async endSession() {}
  };

  mongoose.startSession = async () => fakeSession;

  Blog.findByIdAndDelete = async (id) => {
    deletedBlogId = id;
    return { _id: id };
  };

  Comment.deleteMany = async (filter) => {
    deletedCommentBlogId = filter.blog;
    return { deletedCount: 1 };
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  try {
    await deleteBlogById({ params: { blogId: 'blog-2' } }, res);

    assert.equal(deletedBlogId, 'blog-2');
    assert.equal(deletedCommentBlogId, 'blog-2');
    assert.equal(res.statusCode, undefined);
    assert.deepEqual(res.payload, { message: 'Blog deleted successfully !' });
  } finally {
    mongoose.startSession = originalStartSession;
    Blog.findByIdAndDelete = originalFindByIdAndDelete;
    Comment.deleteMany = originalDeleteMany;
  }
});
