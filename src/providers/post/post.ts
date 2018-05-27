import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  list = []
  displayNew = []
  detail = {}
  page = 1
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("post")
  }
  getUserPost(userList) {
    // check if friendlist vaild
    this.list = []
    var userListNumber = userList.length - 1
    userList.forEach((userId, userIndex) => {
      this.ref.child("list/" + userId).once("value").then(userPostDataListSnap => {
        var userPostDataList = userPostDataListSnap.val()
        if(this.service.valid(userPostDataList)) {
          var userPostList = this.service.objToList(userPostDataList)
          this.list = this.list.concat(userPostList)
        }
        if(userListNumber === userIndex) {
          this.service.event.publish("get-group-post-list")
        }
      })
    });
  }
  getGroupPost(groupList) {
    // check if friendlist vaild
    var groupListNumber = groupList.length
    if(groupListNumber) {
      var end = groupListNumber - 1
      groupList.forEach((groupId, groupIndex) => {
        this.ref.child("list/" + groupId).once("value").then(groupPostDataListSnap => {
          var groupPostDataList = groupPostDataListSnap.val()
          if(this.service.valid(groupPostDataList)) {
            var groupPostList = this.service.objToList(groupPostDataList)
            this.list = this.list.concat(groupPostList)
          }
          if(end === groupIndex) {
            this.service.event.publish("get-initiaze-finish")
          }
        })
      });  
    }
    else {
      this.service.event.publish("get-initiaze-finish")
    }
  }
  // this function may error
  getPostDetail(postId, postIndex) {

    this.ref.child("detail/" + postId).once("value").then(postDataSnap => {
      var postData = postDataSnap.val()
      
      // check if below line cause error
      if(postData.image === undefined) {
        postData.image = []
      }
      postData.time = new Date(this.list[postIndex].time)
      postData.like = this.service.objToKeyList(postData.like)
      this.detail[postId] = postData
      this.displayNew[postIndex].display = true
      // check if below line cause error
    })
  }

  getPostDetailList(postList, userList) {
    var postRef = this.service.db.ref("post")
    var end = postList.length
    if(end) {
      var from = 0
      var to = end > 8 ? 8 : end
      end = to - 1
      var postListToLoad = []
      while(from < to) {
        postListToLoad.push(postList[from])
        from ++
      }
      postListToLoad.forEach((postData, index) => {
        if(userList.indexOf(postData.userId) < 0) {
          userList.push(postData.userId)    
        }
        if(!this.service.valid(this.detail[postData.postId])) {
          postRef.child("detail").child(postData.postId).once("value").then(postSnap => {
            var post = postSnap.val()
            
            // check if below line cause error
            if(post.image === undefined) {
              post.image = []
            }
            post.time = new Date(postData.time)
            this.detail[postData.postId] = post
            // check if below line cause error
            if(index === end) {
              this.service.event.publish("get-user-data", userList)
            }
          })
        }
      })
    }
    else {
      this.service.event.publish("get-user-data", userList)
    }
  }
  // ref error
  pushAPost(userId, content, image) {
    this.service.event.publish("loading")
    var postId = this.ref.child("detail").push().key
    var listId = this.ref.child("list").push().key
    var currTime = Date.now()
    var listData = {
      postId: postId,
      userId: userId,
      type: 0, //userpost
      time: currTime,
      like: 0,
      comment: 0
    }
    var detailData = {
      msg: content,
      userId: userId
    }
    detailData["image"] = []
    if(image.length > 0) {
      detailData["image"] = image
    }
    var updateData = {}
    updateData["post/detail/" + postId] = detailData
    updateData["post/list/" + userId + "/" + listId] = listData
    this.ref.parent.update(updateData).then(() => {
      this.list.push(listData)
      detailData["time"] = new Date(listData.time)
      this.detail[postId] = detailData
      var temp = []
      this.displayNew.forEach((newId, newIndex) => {
        temp[newIndex + 1] = newId
      })
      temp[0] = {
        postId: postId,
        type: 0,
        display: true
      }
      this.displayNew = temp
      this.service.event.publish("finish-load")
    })
  }
  changePostContent(postId, content, image) {
    this.service.event.publish("loading")
    if(image === undefined) {
      image = []
    }
    var currTime = Date.now()
    var detailPost = {
      msg: content,
      image: image,
      modTIme: currTime
    }
    this.ref.child("detail/" + postId).update(detailPost).then(() => {
      this.detail[postId].msg = content
      this.detail[postId].image = image
      this.service.event.publish("finish-load")
    })
  }

  deletePost(userId, postId) {
    this.ref.child("detail/" + postId).remove().then(() => {
      var list = this.list.filter(postList => {
        return postList.postId !== postId
      })
      this.ref.child("list/" + userId).set(list).then(() => {
        if(this.displayNew.indexOf(postId) >= 0) {
          this.displayNew = this.displayNew.filter(postIdList => {
            return postIdList !== postId 
          })
        }
        if(this.list.indexOf(postId) >= 0) {
          this.list = this.list.filter(postListData => {
            return postListData.postId !== postId 
          })
        }
        this.detail[postId] = null
        this.service.event.publish("finish-load")  
      })
    })
  }
  
  like(userId, postId, like) {
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/like").set(like).then(() => {
      this.detail[postId].like = like
      this.service.event.publish('finish-load')
    })
  }

  unlike(userId, postId, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/like").set(like).then(() => {
      this.detail[postId].like = like
      this.service.event.publish('finish-load')
    })
  }
  
  comment(userId, postId, comment, msg) {
    this.service.event.publish('loading')
    var currTime = Date.now()
    var commentData
    commentData = {
      userId: userId,
      msg: msg,
      time: currTime
    }
    
    // realtime issue
    this.ref.child("comment/" + postId).push(commentData).then(() => {
      this.service.event.publish('finish-load')
    })
  }
  changeComment(postId, commentId, msg) {
    this.service.event.publish("loading")
    var currTime = Date.now()
    this.ref.child("comment/" + postId + "/" + commentId).update({msg: msg}).then(() => {
      this.service.event.publish("finish-load")
    })
  }
  likeComment(userId, postId, commentIndex, like) {
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/like").set(like).then(() => {
      this.detail[postId].comment[commentIndex].like = like
      this.service.event.publish('finish-load')
    })
  }

  unlikeComment(userId, postId, commentIndex, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/like").set(like).then(() => {
      this.detail[postId].comment[commentIndex].like = like
      this.service.event.publish('finish-load')
    })
  }
  
  delComment(postId, commentId) {
    this.service.event.publish('loading')
    this.ref.child("comment/" + postId + "/" + commentId).remove().then(() => {
      this.service.event.publish('finish-load')
    })
  }

  subcomment(userId, postId, subcomment, commentIndex, msg) {
    this.service.event.publish('loading')
    var currTime = Date.now()
    subcomment.push({
      userId: userId,
      msg: msg,
      time: currTime
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment")
        .update(subcomment).then(() => {
          subcomment[subcomment.length - 1].time = new Date(subcomment.time)
          this.detail[postId].comment[commentIndex].subcomment = subcomment
          this.service.event.publish('finish-load')
        })
  }
  delSubcomment(postId, subcomment, commentIndex, subcommentIndex) {
    this.service.event.publish('loading')
    subcomment = subcomment.filter((subcommentData, index) => {
      return subcommentIndex !== index
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment")
        .update(subcomment).then(() => {
          this.detail[postId].comment[commentIndex].subcomment = subcomment
          this.service.event.publish('finish-load')
        })
  }
  likeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('finish-load')
        })
  }

  unlikeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('finish-load')
        })
  }
}
