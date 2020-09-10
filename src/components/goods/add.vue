<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 提示区域 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeindex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <!-- <el-step title="商品参数"></el-step> -->
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addform"
        :rules="addformrules"
        ref="addformref"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeindex"
          :before-leave="beforeleave"
          @tab-click="tabclick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addform.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addform.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addform.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addform.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addform.goods_cat"
                :options="catelist"
                :props="cascaderprops"
                @change="handlechange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- <el-tab-pane label="商品参数">商品参数</el-tab-pane> -->
          <el-tab-pane label="商品属性" name="1">
            <el-form-item :label="item.attr_name" v-for="item in onlytabledata" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="2">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerobj"
              :on-success="handlesuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="3">
            <quill-editor v-model="addform.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- //图片展示对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewpath" class="previewimg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data() {
    return {
      activeindex: "0",
      addform: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addformrules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      catelist: [],
      cascaderprops: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      onlytabledata: [],
      headerobj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewpath: "",
      previewVisible: false,
    };
  },
  created() {
    this.getcatelist();
  },
  methods: {
    async getcatelist() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      //console.log(res.data);
      this.catelist = res.data;
      //console.log(this.catelist);
      //this.total = res.data.total;
    },
    // 监听级联选择器变化
    handlechange() {
      if (this.addform.goods_cat.length !== 3) {
        this.addform.goods_cat = [];
      }
      //console.log(this.addform.goods_cat)
    },

    beforeleave(activeName, oldactivename) {
      //console.log(activeName,oldactivename)
      if (oldactivename === "0" && this.addform.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },

    async tabclick() {
      if (this.activeindex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateid}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败！");
        }
        //console.log(res.data)
        this.onlytabledata = res.data;
      }
    },
    //处理图片预览
    handlePreview(file) {
      this.previewpath = file.response.data.url;
      this.previewVisible = true;
    },
    //处理图片删除
    handleRemove(file) {
      const filepath = file.response.data.tmp_path;
      const i = this.addform.pics.findIndex((x) => x.pic === filepath);
      this.addform.pics.splice(i, 1);
      console.log(this.addform);
    },
    //监听图片上传成功
    handlesuccess(response) {
      const picinfo = { pic: response.data.tmp_path };
      this.addform.pics.push(picinfo);
      console.log(this.addform);
    },
    add() {
      this.$refs.addformref.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        //深拷贝
        const form = _.cloneDeep(this.addform);
        form.goods_cat = form.goods_cat.join(",");

        this.onlytabledata.forEach((item) => {
          const newinfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addform.attrs.push(newinfo);
        });
        form.attrs = this.addform.attrs;

        console.log(form);

        const {data:res}=await this.$http.post("goods", form);
        if(res.meta.status!==201){
            return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      });
      //console.log(this.addform)
    },
  },

  computed: {
    cateid() {
      if (this.addform.goods_cat.length === 3) {
        return this.addform.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang='less' scoped>
.previewimg {
  width: 100%;
}
.btn {
  margin-top: 15px;
}
</style>