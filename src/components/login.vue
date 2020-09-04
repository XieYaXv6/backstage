<template>
    <div class="container">
      <div class="box">
          <!-- 头像 -->
          <div class="avatar">
              <img src="../assets/logo.png" alt="">
          </div>
          <!-- 表单 -->
          <el-form ref="loginformref" :model="loginform" :rules="loginformrules"  label-width="0px" class="from">
            <el-form-item prop="username">
                <el-input v-model="loginform.username" prefix-icon="el-icon-user"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginform.password" prefix-icon="el-icon-lock" type="password"></el-input>
            </el-form-item>
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetloginform">重置</el-button>
            </el-form-item>
          </el-form>
      </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            loginform:{
                username:'admin',
                password:'123456',
            },
             loginformrules:{
                username:[
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password:[
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
            }
        };
    },
    methods:{
        resetloginform(){
            //console.log(this)
            this.$refs.loginformref.resetFields();
        },
        login(){
            this.$refs.loginformref.validate(async valid=>{
                //console.log(valid)
                if(!valid) return;
                const result=await this.$http.post('login',this.loginform);
                //console.log(result);
                if(result.data.meta.status!==200) {
                    return this.$message.error("登录失败!")
                }else{
                    this.$message.success("登录成功!")
                    window.sessionStorage.setItem("token",result.data.data.token)
                    this.$router.push('/home')
                    console.log(result)
                }
                
            })
        }
    }

};
</script>

<style lang="less" scoped>

.container{
    background-color: #2b4b6b;
    height: 100%;
}
.box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatar{
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px;
        position: absolute;
        left: 50%;
        background-color: #fff;
        transform: translate(-50%,-50%);
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }

.from{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing:border-box;
}
.btns{
    display: flex;
    justify-content: flex-end;
}
}
</style>